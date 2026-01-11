// SolarSystem.tsx
'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    OrbitControls,
    Stars,
    Environment,
    Loader,
    useCursor,
    useTexture as useTextureDrei,
} from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';
import { PLANETS } from '@/constants/solarSystem.constants';
import { PlanetProps } from '../../../globals';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const MAX_CAMERA_DISTANCE = 20000;

/**
 * ---------- Immersive realism knobs ----------
 */
const TIME_SCALE = 0.18;
const ORBIT_POWER = 0.58;
const ORBIT_MULT = 26;

const SUN_VISUAL_RADIUS = 32;
const SUN_REAL_RADIUS_KM = 696_340;

const RADIUS_POWER = 0.42;
const PLANET_MIN_RADIUS = 0.35;

/**
 * Map real-ish distances (million km) into explorable world units
 */
const mapOrbitFromAvgDistance = (avgMillionKm?: number, fallback = 100) => {
    const d = avgMillionKm ?? fallback;
    return ORBIT_MULT * Math.pow(d, ORBIT_POWER);
};

/**
 * Map real radius (km) into usable planet radii while keeping proportions
 */
const mapRadiusFromReal = (realRadiusKm?: number, fallback = 1) => {
    if (!realRadiusKm) return fallback;
    const ratio = realRadiusKm / SUN_REAL_RADIUS_KM;
    return Math.max(PLANET_MIN_RADIUS, SUN_VISUAL_RADIUS * Math.pow(ratio, RADIUS_POWER));
};

const useTexture = (path?: string) =>
    useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);

type FocusTarget = { type: 'sun' } | { type: 'planet'; name: string } | null;
type PlanetPositionStore = Record<string, THREE.Vector3>;

const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [focusedTarget, setFocusedTarget] = useState<FocusTarget>({ type: 'sun' });
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState(false);
    const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);

    const controlsRef = useRef<OrbitControlsImpl | null>(null);
    const planetPositionsRef = useRef<PlanetPositionStore>({});

    const planetsByName = useMemo(() => {
        const m = new Map<string, (typeof PLANETS)[number]>();
        for (const p of PLANETS) m.set(p.name, p);
        return m;
    }, []);

    const updatePlanetPosition = useCallback((name: string, pos: THREE.Vector3) => {
        planetPositionsRef.current[name] = pos.clone();
    }, []);

    const getPlanetPosition = useCallback((name: string) => {
        return planetPositionsRef.current[name]?.clone() ?? null;
    }, []);

    const toggleCameraRotation = () => setIsCameraRotationEnabled((prev) => !prev);

    // ✅ compute farthest mapped orbit so stars always stay outside
    const outermostOrbit = useMemo(() => {
        let max = 0;
        for (const p of PLANETS) {
            const orbit = mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance);
            if (orbit > max) max = orbit;
        }
        return max;
    }, []);

    return (
        <div className="relative">
            <Canvas
                camera={{ position: [0, 10, 200], near: 0.1, far: 20000 }}
                gl={{ logarithmicDepthBuffer: true }}
                style={{ height: '100vh' }}
                shadows
            >
                {/* Infinite panorama background */}
                <Suspense fallback={null}>
                    <PanoramaBackground texturePath="/solar-system.png" />
                </Suspense>

                <EffectComposer>
                    <Bloom mipmapBlur luminanceThreshold={1} intensity={1.5} />
                    <ToneMapping />
                </EffectComposer>

                <ambientLight intensity={0.05} />
                <pointLight position={[0, 0, 0]} intensity={2} castShadow />
                <directionalLight position={[0, 20, 20]} intensity={1} castShadow />

                {/* ✅ True "Oort Cloud shell" (2 thin star shells) */}
                <OortCloud outermostOrbit={outermostOrbit} />

                <SolarSystemScene
                    setSelectedPlanet={setSelectedPlanet}
                    setFocusedTarget={setFocusedTarget}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    selectedPlanet={selectedPlanet}
                    focusedTarget={focusedTarget}
                    onPlanetPosition={updatePlanetPosition}
                />

                {/* Follow target but preserve user zoom */}
                <CameraController
                    controlsRef={controlsRef}
                    focusedTarget={focusedTarget}
                    getPlanetPosition={getPlanetPosition}
                    getPlanetRadius={(name) => {
                        const p = planetsByName.get(name);
                        if (!p) return 1;
                        return mapRadiusFromReal((p as any).realRadius, p.radius);
                    }}
                />

                <OrbitControls
                    ref={controlsRef}
                    enableDamping
                    dampingFactor={0.08}
                    maxDistance={MAX_CAMERA_DISTANCE}
                    minDistance={10}
                    enableZoom
                    zoomSpeed={1.4}
                />

                <Environment preset="night" />
            </Canvas>

            <PlanetMenu
                selectedPlanet={selectedPlanet}
                focusedTarget={focusedTarget}
                isPlanetMenuOpen={isPlanetMenuOpen}
                setIsPlanetMenuOpen={setIsPlanetMenuOpen}
                setSelectedPlanet={setSelectedPlanet}
                setFocusedTarget={setFocusedTarget}
                toggleCameraRotation={toggleCameraRotation}
                isCameraRotationEnabled={isCameraRotationEnabled}
            />

            <Loader />
        </div>
    );
};

const PanoramaBackground = ({ texturePath }: { texturePath: string }) => {
    const texture = useTextureDrei(texturePath);
    const { scene } = useThree();

    useEffect(() => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;

        scene.background = texture;

        return () => {
            if (scene.background === texture) scene.background = null;
        };
    }, [scene, texture]);

    return null;
};

/**
 * ✅ "True Oort Cloud shell":
 * Two thin shells far outside the farthest planet orbit.
 * depth kept small => a shell, not a filled star volume.
 */
const OortCloud = ({ outermostOrbit }: { outermostOrbit: number }) => {
    const innerRadius = outermostOrbit * 2.1;
    const innerDepth = innerRadius * 0.08;

    const outerRadius = outermostOrbit * 2.9;
    const outerDepth = outerRadius * 0.06;

    return (
        <>
            {/* Inner shell (denser) */}
            <Stars
                radius={innerRadius}
                depth={innerDepth}
                count={7000}
                factor={4.5}
                fade
                speed={0.2}
            />

            {/* Outer shell (sparser) */}
            <Stars
                radius={outerRadius}
                depth={outerDepth}
                count={4500}
                factor={6.5}
                fade
                speed={0.12}
            />
        </>
    );
};

/**
 * Follow controller that preserves user zoom.
 * It adjusts OrbitControls target (planet/sun), but keeps the current camera distance.
 */
const CameraController = ({
    controlsRef,
    focusedTarget,
    getPlanetPosition,
    getPlanetRadius,
}: {
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
    focusedTarget: FocusTarget;
    getPlanetPosition: (name: string) => THREE.Vector3 | null;
    getPlanetRadius: (name: string) => number;
}) => {
    const { camera } = useThree();

    const tmpTarget = useMemo(() => new THREE.Vector3(), []);
    const tmpOffset = useMemo(() => new THREE.Vector3(), []);
    const tmpDesiredPos = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        if (!focusedTarget) return;

        if (focusedTarget.type === 'sun') {
            tmpTarget.set(0, 0, 0);
        } else {
            const live = getPlanetPosition(focusedTarget.name);
            if (!live) return;
            tmpTarget.copy(live);
        }

        const controls = controlsRef.current;

        if (controls) tmpOffset.copy(controls.object.position).sub(controls.target);
        else tmpOffset.copy(camera.position).sub(tmpTarget);

        let distance = tmpOffset.length();

        const minDistance =
            focusedTarget.type === 'sun'
                ? 140
                : Math.max(10, getPlanetRadius(focusedTarget.name) * 6.0);

        distance = THREE.MathUtils.clamp(distance, minDistance, MAX_CAMERA_DISTANCE);

        tmpOffset.normalize().multiplyScalar(distance);
        tmpDesiredPos.copy(tmpTarget).add(tmpOffset);

        camera.position.lerp(tmpDesiredPos, 0.18);

        if (controls) {
            controls.target.lerp(tmpTarget, 0.22);
            controls.update();
        } else {
            camera.lookAt(tmpTarget);
        }
    });

    return null;
};

const SolarSystemScene = ({
    setSelectedPlanet,
    setFocusedTarget,
    isCameraRotationEnabled,
    selectedPlanet,
    focusedTarget,
    onPlanetPosition,
}: {
    setSelectedPlanet: (planetName: string | null) => void;
    setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    focusedTarget: FocusTarget;
    onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
}) => {
    const sunRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (sunRef.current) sunRef.current.rotation.y += 0.005;
    });

    return (
        <>
            {/* Sun */}
            <mesh
                ref={sunRef}
                position={[0, 0, 0]}
                onClick={() => {
                    setFocusedTarget({ type: 'sun' });
                    setSelectedPlanet(null);
                }}
            >
                <sphereGeometry args={[SUN_VISUAL_RADIUS, 32, 32]} />
                <meshStandardMaterial emissive="white" emissiveIntensity={8} color="#fff1cc" />
            </mesh>

            {/* Orbits (real-ish distances compressed) */}
            {PLANETS.map((p) => {
                const orbit = mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance);
                return (
                    <mesh key={`${p.name}-orbit`} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[orbit - 0.2, orbit + 0.2, 128]} />
                        <meshBasicMaterial
                            color="#333"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.35}
                        />
                    </mesh>
                );
            })}

            {/* Planets (real radii + compressed distances) */}
            {PLANETS.map((p) => (
                <Planet
                    key={p.name}
                    {...(p as PlanetProps)}
                    distance={mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance)}
                    radius={mapRadiusFromReal((p as any).realRadius, p.radius)}
                    setSelectedPlanet={setSelectedPlanet}
                    setFocusedTarget={setFocusedTarget}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    selectedPlanet={selectedPlanet}
                    focusedTarget={focusedTarget}
                    onPlanetPosition={onPlanetPosition}
                />
            ))}
        </>
    );
};

const calculateOrbitPosition = (time: number, distance: number) => ({
    x: Math.cos(time) * distance,
    z: Math.sin(time) * distance,
});

const Planet = ({
    name,
    radius,
    distance,
    speed,
    color,
    texture,
    angle,
    setSelectedPlanet,
    setFocusedTarget,
    isCameraRotationEnabled,
    selectedPlanet,
    focusedTarget,
    onPlanetPosition,
}: PlanetProps & {
    setSelectedPlanet: (planetName: string | null) => void;
    setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    focusedTarget: FocusTarget;
    onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const planetTexture = useTexture(texture);
    useCursor(hovered);

    const tmpWorld = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ clock }) => {
        const g = groupRef.current;
        if (!g) return;

        if (isCameraRotationEnabled) {
            const t = clock.getElapsedTime() * TIME_SCALE * speed;
            const { x, z } = calculateOrbitPosition(t, distance);

            // Subtle orbital inclination using your "angle" degrees
            const tilt = THREE.MathUtils.degToRad(angle ?? 0);
            const y = Math.sin(t) * Math.sin(tilt) * (distance * 0.05);

            g.position.set(x, y, z);
        }

        // Axial spin
        if (meshRef.current) meshRef.current.rotation.y += 0.01;

        g.getWorldPosition(tmpWorld);
        onPlanetPosition(name, tmpWorld);
    });

    const handleClick = () => {
        setSelectedPlanet(name);
        setFocusedTarget({ type: 'planet', name });
    };

    const isSelected = selectedPlanet === name;
    const isFocused = focusedTarget?.type === 'planet' && focusedTarget.name === name;
    const scale = isFocused ? 1.35 : isSelected ? 1.25 : hovered ? 1.12 : 1;

    return (
        <group
            ref={groupRef}
            onClick={handleClick}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
            }}
            onPointerOut={(e) => {
                e.stopPropagation();
                setHovered(false);
            }}
            scale={scale}
        >
            <mesh ref={meshRef} castShadow receiveShadow>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    map={planetTexture || null}
                    color={color || 'white'}
                    emissive={isFocused ? 'white' : color || 'white'}
                    emissiveIntensity={isFocused ? 0.65 : 0.08}
                    roughness={1}
                    metalness={0}
                />
            </mesh>
        </group>
    );
};

export default SolarSystem;
