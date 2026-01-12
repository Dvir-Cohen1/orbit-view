// SolarSystem.tsx
'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
    Billboard,
    Environment,
    Line,
    Loader,
    OrbitControls,
    Stars,
    Text,
    Trail,
    useCursor,
    useTexture as useTextureDrei,
} from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useSearchParams } from 'next/navigation';
import { ToneMappingMode } from 'postprocessing';

import PlanetMenu from './PlanetMenu';
import SceneSettingsMenu from './SceneSettingsMenu';
import { PLANETS } from '@/constants/solarSystem.constants';
import { PlanetProps } from '../../../globals';

const MAX_CAMERA_DISTANCE = 51000;

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

const ORBIT_Y_LIFT = 0.02;
const ORBIT_RING_HALF_WIDTH = 0.12;

const AU_MILLION_KM = 149.6;
const HZ_AU = {
    // Conservative HZ (Mars often inside)
    habInner: 0.95,
    habOuter: 1.5,

    // For your visual red/blue "too hot/too cold" bands
    hotInner: 0.35,
    coldOuter: 5.50,
} as const;

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

// kept from your code — fine for local static textures
const useTexture = (path?: string) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);

type FocusTarget = { type: 'sun' } | { type: 'planet'; name: string } | null;
type PlanetPositionStore = Record<string, THREE.Vector3>;

/**
 * ✅ Memoized dashed orbit line – points computed once per radius
 */
const OrbitLine = React.memo(function OrbitLine({
    radius,
    opacity = 0.25,
}: {
    radius: number;
    opacity?: number;
}) {
    const points = useMemo(() => {
        const segments = 384;
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i <= segments; i++) {
            const a = (i / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
        }
        return pts;
    }, [radius]);

    return (
        <group position={[0, ORBIT_Y_LIFT, 0]}>
            <Line
                points={points}
                color="#b9c1cc"
                transparent
                opacity={opacity}
                lineWidth={1}
                dashed
                dashSize={12}
                gapSize={10}
                toneMapped={false}
            />
        </group>
    );
});

// soft alpha texture for band edges (reused for all 3 rings)
function createBandAlphaTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 8;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const fallback = new THREE.Texture();
        fallback.needsUpdate = true;
        return fallback;
    }

    // Transparent -> solid -> transparent across U
    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0.0, 'rgba(255,255,255,0.0)');
    g.addColorStop(0.12, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
    g.addColorStop(0.88, 'rgba(255,255,255,0.35)');
    g.addColorStop(1.0, 'rgba(255,255,255,0.0)');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, canvas.height);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
}

/**
 * ✅ Habitable Zone as orbit-aligned annular bands (distance from Sun)
 * Hot: inner -> 0.95 AU
 * Habitable: 0.95 -> 1.67 AU (Earth at ~1 AU)
 * Cold: 1.67 -> 2.7 AU (extends beyond Mars)
 */
const HabitableZone = React.memo(function HabitableZone() {
    const alphaTex = useMemo(() => createBandAlphaTexture(512), []);

    // These radii are computed in "world units" using the same mapping as planets
    const radii = useMemo(() => {
        const hotInner = mapOrbitFromAvgDistance(HZ_AU.hotInner * AU_MILLION_KM);
        const hotOuter = mapOrbitFromAvgDistance(HZ_AU.habInner * AU_MILLION_KM);

        const habInner = hotOuter;
        const habOuter = mapOrbitFromAvgDistance(HZ_AU.habOuter * AU_MILLION_KM);

        const coldInner = habOuter;
        const coldOuter = mapOrbitFromAvgDistance(HZ_AU.coldOuter * AU_MILLION_KM);

        return { hotInner, hotOuter, habInner, habOuter, coldInner, coldOuter };
    }, []);

    const commonMat = {
        transparent: true,
        depthWrite: false,
        toneMapped: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        alphaMap: alphaTex,
        opacity: 0.05, // subtle
    };

    // slight lift above orbit rings/lines to avoid z-fighting
    const y = ORBIT_Y_LIFT + 0.012;

    return (
        <group rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]} renderOrder={-2}>
            {/* Too hot (red) */}
            <mesh>
                <ringGeometry args={[radii.hotInner, radii.hotOuter, 256, 1]} />
                <meshBasicMaterial {...commonMat} color="#ff3b3b" />
            </mesh>

            {/* Habitable (green) */}
            <mesh>
                <ringGeometry args={[radii.habInner, radii.habOuter, 256, 1]} />
                <meshBasicMaterial {...commonMat} color="#39ff88" opacity={0.11} />
            </mesh>

            {/* Too cold (blue) */}
            <mesh>
                <ringGeometry args={[radii.coldInner, radii.coldOuter, 256, 1]} />
                <meshBasicMaterial {...commonMat} color="#3bb3ff" />
            </mesh>
        </group>
    );
});


const SolarSystem = () => {
    const searchParams = useSearchParams();

    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [focusedTarget, setFocusedTarget] = useState<FocusTarget>({ type: 'sun' });
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState(false);
    const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);

    // scene settings
    const [isSceneMenuOpen, setIsSceneMenuOpen] = useState(false);
    const [bloomEnabled, setBloomEnabled] = useState(true);
    const [orbitRingsEnabled, setOrbitRingsEnabled] = useState(true);
    const [orbitLinesEnabled, setOrbitLinesEnabled] = useState(true);

    // labels toggle
    const [planetLabelsEnabled, setPlanetLabelsEnabled] = useState(true);

    // habitable zone toggle
    const [habitableZoneEnabled, setHabitableZoneEnabled] = useState(true);

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

    useEffect(() => {
        const focus = searchParams.get('focus');
        if (!focus) return;
        setSelectedPlanet(focus);
        setFocusedTarget({ type: 'planet', name: focus });
    }, [searchParams]);

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
                camera={{ position: [0, 10, 200], near: 0.1, far: 40000 }}
                gl={{ logarithmicDepthBuffer: true }}
                onCreated={({ gl }) => {
                    gl.toneMapping = THREE.NoToneMapping;
                    gl.toneMappingExposure = 1;
                }}
                style={{ height: '100vh' }}
                shadows
            >
                <Suspense fallback={null}>
                    <PanoramaBackground texturePath="/solar-system.png" driftSpeed={0.0025} />
                </Suspense>

                <EffectComposer>
                    <Bloom mipmapBlur luminanceThreshold={1} intensity={bloomEnabled ? 1.4 : 0} />
                    <ToneMapping
                        adaptive={false}
                        mode={ToneMappingMode.ACES_FILMIC}
                        averageLuminance={1}
                        middleGrey={0.6}
                        maxLuminance={16}
                        minLuminance={0.01}
                    />
                    <Vignette eskil={false} offset={0.12} darkness={0.45} />
                </EffectComposer>

                <ambientLight intensity={0.05} />
                <pointLight position={[0, 0, 0]} intensity={2} castShadow />
                <directionalLight position={[0, 20, 20]} intensity={1} castShadow />

                <OortCloud outermostOrbit={outermostOrbit} />
                <GalacticDustPlane outermostOrbit={outermostOrbit} />

                <SolarSystemScene
                    setSelectedPlanet={setSelectedPlanet}
                    setFocusedTarget={setFocusedTarget}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    selectedPlanet={selectedPlanet}
                    focusedTarget={focusedTarget}
                    onPlanetPosition={updatePlanetPosition}
                    orbitRingsEnabled={orbitRingsEnabled}
                    orbitLinesEnabled={orbitLinesEnabled}
                    planetLabelsEnabled={planetLabelsEnabled}
                    habitableZoneEnabled={habitableZoneEnabled}
                />

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

                <Environment preset="night" background={false} />
            </Canvas>

            {/* ✅ Right Scene Settings Menu */}
            <SceneSettingsMenu
                isOpen={isSceneMenuOpen}
                setIsOpen={setIsSceneMenuOpen}
                bloomEnabled={bloomEnabled}
                setBloomEnabled={setBloomEnabled}
                orbitRingsEnabled={orbitRingsEnabled}
                setOrbitRingsEnabled={setOrbitRingsEnabled}
                orbitLinesEnabled={orbitLinesEnabled}
                setOrbitLinesEnabled={setOrbitLinesEnabled}
                planetLabelsEnabled={planetLabelsEnabled}
                setPlanetLabelsEnabled={setPlanetLabelsEnabled}
                habitableZoneEnabled={habitableZoneEnabled}
                setHabitableZoneEnabled={setHabitableZoneEnabled}
            />

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

const PanoramaBackground = ({
    texturePath,
    driftSpeed = 0.0,
}: {
    texturePath: string;
    driftSpeed?: number;
}) => {
    const texture = useTextureDrei(texturePath);
    const { scene } = useThree();

    useEffect(() => {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.center.set(0.5, 0.5);
        texture.needsUpdate = true;

        scene.background = texture;
        scene.backgroundIntensity = 0.38;

        return () => {
            if (scene.background === texture) {
                scene.background = null;
                scene.backgroundIntensity = 1;
            }
        };
    }, [scene, texture]);

    useFrame((_, delta) => {
        scene.backgroundIntensity = 0.38;
        if (driftSpeed > 0) texture.rotation += driftSpeed * delta;
    });

    return null;
};

const OortCloud = ({ outermostOrbit }: { outermostOrbit: number }) => {
    const innerRadius = outermostOrbit * 2.1;
    const innerDepth = innerRadius * 0.08;

    const outerRadius = outermostOrbit * 2.9;
    const outerDepth = outerRadius * 0.06;

    return (
        <>
            <Stars radius={innerRadius} depth={innerDepth} count={6500} factor={3.2} saturation={0.2} fade speed={0.15} />
            <Stars radius={outerRadius} depth={outerDepth} count={4200} factor={4.0} saturation={0.15} fade speed={0.1} />
        </>
    );
};

const GalacticDustPlane = ({ outermostOrbit }: { outermostOrbit: number }) => {
    const tex = useMemo(() => createDustTexture(1024), []);
    const planeRef = useRef<THREE.Mesh>(null);
    const size = outermostOrbit * 6.5;

    useFrame((_, delta) => {
        const m = planeRef.current;
        if (!m) return;
        m.rotation.z += delta * 0.01;
    });

    return (
        <mesh
            ref={planeRef}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -outermostOrbit * 0.35, 0]}
            renderOrder={-10}
        >
            <planeGeometry args={[size, size, 1, 1]} />
            <meshBasicMaterial
                map={tex}
                transparent
                opacity={0.12}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                side={THREE.DoubleSide}
            />
        </mesh>
    );
};

function createDustTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const fallback = new THREE.Texture();
        fallback.needsUpdate = true;
        return fallback;
    }

    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 2200; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = 6 + Math.random() * 60;
        const a = Math.random() * 0.045;

        const centerBias = 1 - Math.min(1, Math.abs(y - size / 2) / (size / 2));
        const alpha = a * (0.35 + centerBias * 0.9);

        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0, `rgba(255,255,255,${alpha})`);
        g.addColorStop(1, `rgba(255,255,255,0)`);

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(2, 2);
    tex.anisotropy = 8;
    tex.needsUpdate = true;
    return tex;
}

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

        if (focusedTarget.type === 'sun') tmpTarget.set(0, 0, 0);
        else {
            const live = getPlanetPosition(focusedTarget.name);
            if (!live) return;
            tmpTarget.copy(live);
        }

        const controls = controlsRef.current;
        if (controls) tmpOffset.copy(controls.object.position).sub(controls.target);
        else tmpOffset.copy(camera.position).sub(tmpTarget);

        let distance = tmpOffset.length();
        const minDistance =
            focusedTarget.type === 'sun' ? 140 : Math.max(10, getPlanetRadius(focusedTarget.name) * 6.0);

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
    orbitRingsEnabled,
    orbitLinesEnabled,
    planetLabelsEnabled,
    habitableZoneEnabled,
}: {
    setSelectedPlanet: (planetName: string | null) => void;
    setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    focusedTarget: FocusTarget;
    onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
    orbitRingsEnabled: boolean;
    orbitLinesEnabled: boolean;
    planetLabelsEnabled: boolean;
    habitableZoneEnabled: boolean;
}) => {
    const sunRef = useRef<THREE.Group>(null);
    const sunMatRef = useRef<THREE.MeshStandardMaterial>(null);
    const coronaMatRef = useRef<THREE.MeshBasicMaterial>(null);
    const haloMatRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(({ clock }) => {
        if (sunRef.current) sunRef.current.rotation.y += 0.002;

        const t = clock.getElapsedTime();
        const flicker = 8 + Math.sin(t * 1.7) * 0.25 + Math.sin(t * 7.3) * 0.12;
        if (sunMatRef.current) sunMatRef.current.emissiveIntensity = flicker;

        const breathe = 1 + Math.sin(t * 1.2) * 0.01;
        if (coronaMatRef.current) coronaMatRef.current.opacity = 0.14 * breathe;
        if (haloMatRef.current) haloMatRef.current.opacity = 0.08 * breathe;
    });

    const orbitRadii = useMemo(() => {
        return PLANETS.map((p) => ({
            name: p.name,
            radius: mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance),
        }));
    }, []);


    const earthOrbit = useMemo(() => {
        const earth = PLANETS.find((p) => p.name === 'Earth');
        if (!earth) return mapOrbitFromAvgDistance(undefined, 150);
        return mapOrbitFromAvgDistance((earth as any).avgDistanceFromSun, earth.distance);
    }, []);
    return (
        <>
            <group
                ref={sunRef}
                position={[0, 0, 0]}
                onClick={() => {
                    setFocusedTarget({ type: 'sun' });
                    setSelectedPlanet(null);
                }}
            >
                <mesh castShadow receiveShadow>
                    <sphereGeometry args={[SUN_VISUAL_RADIUS, 48, 48]} />
                    <meshStandardMaterial ref={sunMatRef} emissive="white" emissiveIntensity={8} color="#fff1cc" />
                </mesh>

                <mesh>
                    <sphereGeometry args={[SUN_VISUAL_RADIUS * 1.18, 48, 48]} />
                    <meshBasicMaterial
                        ref={coronaMatRef}
                        color="#ffd27a"
                        transparent
                        toneMapped={false}
                        opacity={0.14}
                        blending={THREE.AdditiveBlending}
                        depthWrite={false}
                    />
                </mesh>

                <mesh>
                    <sphereGeometry args={[SUN_VISUAL_RADIUS * 1.45, 48, 48]} />
                    <meshBasicMaterial
                        ref={haloMatRef}
                        color="#fff2c6"
                        transparent
                        opacity={0.08}
                        blending={THREE.NormalBlending}
                        depthWrite={false}
                    />
                </mesh>
            </group>

            {habitableZoneEnabled && <HabitableZone />}

            {/* Orbit rings */}
            {orbitRingsEnabled &&
                orbitRadii.map(({ name, radius }) => (
                    <mesh
                        key={`${name}-orbitRing`}
                        rotation={[-Math.PI / 2, 0, 0]}
                        position={[0, ORBIT_Y_LIFT, 0]}
                        renderOrder={-1}
                    >
                        <ringGeometry args={[radius - ORBIT_RING_HALF_WIDTH, radius + ORBIT_RING_HALF_WIDTH, 256]} />
                        <meshBasicMaterial
                            color="#b9c1cc"
                            side={THREE.DoubleSide}
                            transparent
                            opacity={0.18}
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            toneMapped={false}
                        />
                    </mesh>
                ))}

            {/* Orbit dashed lines */}
            {orbitLinesEnabled &&
                orbitRadii.map(({ name, radius }) => <OrbitLine key={`${name}-orbitLine`} radius={radius} opacity={0.25} />)}

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
                    angle={(p as any).angle}
                    hasRings={(p as any).hasRings}
                    planetLabelsEnabled={planetLabelsEnabled}
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
    hasRings,
    setSelectedPlanet,
    setFocusedTarget,
    isCameraRotationEnabled,
    selectedPlanet,
    focusedTarget,
    onPlanetPosition,
    planetLabelsEnabled,
}: PlanetProps & {
    setSelectedPlanet: (planetName: string | null) => void;
    setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    focusedTarget: FocusTarget;
    onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
    angle?: number;
    hasRings?: boolean;

    // ✅ NEW
    planetLabelsEnabled: boolean;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    const planetTexture = useTexture(texture);
    useCursor(hovered);

    const tmpWorld = useMemo(() => new THREE.Vector3(), []);
    const isFocused = focusedTarget?.type === 'planet' && focusedTarget.name === name;
    const isSelected = selectedPlanet === name;

    useFrame(({ clock }) => {
        const g = groupRef.current;
        if (!g) return;

        if (isCameraRotationEnabled) {
            const t = clock.getElapsedTime() * TIME_SCALE * speed;
            const { x, z } = calculateOrbitPosition(t, distance);

            const tilt = THREE.MathUtils.degToRad(angle ?? 0);
            const y = Math.sin(t) * Math.sin(tilt) * (distance * 0.05);

            g.position.set(x, y, z);
        }

        if (meshRef.current) meshRef.current.rotation.y += 0.01;

        g.getWorldPosition(tmpWorld);
        onPlanetPosition(name, tmpWorld);
    });

    const handleClick = () => {
        setSelectedPlanet(name);
        setFocusedTarget({ type: 'planet', name });
        try {
            window.localStorage.setItem('ov_last_focus', name);
        } catch { }
    };

    const scale = isFocused ? 1.18 : isSelected ? 1.12 : hovered ? 1.06 : 1;
    const trailLength = 10;
    const trailWidth = Math.max(0.08, radius * 0.08);

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
            <Trail
                width={trailWidth}
                length={trailLength}
                color={color ?? '#ffffff'}
                attenuation={(t) => t * t}
                decay={1}
                local={false}
            >
                <mesh ref={meshRef} castShadow receiveShadow>
                    <sphereGeometry args={[radius, 64, 64]} />
                    <meshStandardMaterial
                        map={planetTexture || null}
                        color={color || 'white'}
                        emissive="#000000"
                        emissiveIntensity={0}
                        roughness={1}
                        metalness={0}
                    />
                </mesh>
            </Trail>

            {name === 'Jupiter' && <JupiterAtmosphere radius={radius} />}
            {hasRings && <SaturnRings planetRadius={radius} />}

            {/* ✅ NEW: always-on label controlled by scene toggle */}
            {planetLabelsEnabled && <PlanetLabel name={name} radius={radius} color={color} />}

            {name === 'Earth' && <EarthMoon earthRadius={radius} />}
        </group>
    );
};

const SaturnRings = ({ planetRadius }: { planetRadius: number }) => {
    const tex = useMemo(() => createSaturnRingsTexture(1024), []);
    const inner = planetRadius * 1.35;
    const outer = planetRadius * 2.35;

    return (
        <mesh rotation={[THREE.MathUtils.degToRad(78), 0, 0]} renderOrder={2}>
            <ringGeometry args={[inner, outer, 256, 1]} />
            <meshBasicMaterial
                map={tex}
                transparent
                opacity={0.9}
                side={THREE.DoubleSide}
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </mesh>
    );
};

function createSaturnRingsTexture(size = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 8;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        const fallback = new THREE.Texture();
        fallback.needsUpdate = true;
        return fallback;
    }

    const g = ctx.createLinearGradient(0, 0, size, 0);
    g.addColorStop(0.0, 'rgba(130,110,85,0)');
    g.addColorStop(0.08, 'rgba(170,150,120,0.25)');
    g.addColorStop(0.18, 'rgba(210,190,160,0.55)');
    g.addColorStop(0.30, 'rgba(240,220,190,0.35)');
    g.addColorStop(0.45, 'rgba(200,180,150,0.50)');
    g.addColorStop(0.62, 'rgba(240,225,200,0.30)');
    g.addColorStop(0.78, 'rgba(190,170,140,0.25)');
    g.addColorStop(1.0, 'rgba(130,110,85,0)');

    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, canvas.height);

    const img = ctx.getImageData(0, 0, size, canvas.height);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * 18;
        data[i] = Math.min(255, Math.max(0, data[i] + n));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + n));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + n));
    }
    ctx.putImageData(img, 0, 0);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
}

const JupiterAtmosphere = ({ radius }: { radius: number }) => {
    const matRef = useRef<THREE.MeshBasicMaterial>(null);

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        const breathe = 1 + Math.sin(t * 0.9) * 0.03;
        if (matRef.current) matRef.current.opacity = 0.12 * breathe;
    });

    return (
        <mesh renderOrder={1}>
            <sphereGeometry args={[radius * 1.07, 48, 48]} />
            <meshBasicMaterial
                ref={matRef}
                color="#ffe0b6"
                transparent
                opacity={0.12}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </mesh>
    );
};

/**
 * ✅ Always-on planet label with fixed reasonable size:
 * We scale the billboard based on camera distance so it looks roughly constant in screen space.
 */
const PlanetLabel = ({
    name,
    radius,
    color,
}: {
    name: string;
    radius: number;
    color?: string;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    // tweak to taste
    const BASE = 0.012;
    const MIN = 0.9;
    const MAX = 6.0;

    const tmpPos = useMemo(() => new THREE.Vector3(), []);
    const tmpCam = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        const g = groupRef.current;
        if (!g) return;

        g.getWorldPosition(tmpPos);
        camera.getWorldPosition(tmpCam);

        const d = tmpPos.distanceTo(tmpCam);
        const s = THREE.MathUtils.clamp(d * BASE, MIN, MAX);
        g.scale.setScalar(s);
    });

    return (
        <Billboard
            ref={groupRef}
            position={[0, radius * 1.85, 0]}
            follow
            lockX={false}
            lockY={false}
            lockZ={false}
        >
            <mesh renderOrder={10}>
                <planeGeometry args={[2.6, 0.9]} />
                <meshBasicMaterial transparent opacity={0.32} color="#000000" depthWrite={false} />
            </mesh>

            <Text
                position={[0, 0, 0.01]}
                fontSize={0.35}
                color={color ?? 'white'}
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.012}
                outlineColor="#000000"
            >
                {name}
            </Text>
        </Billboard>
    );
};

const EarthMoon = ({ earthRadius }: { earthRadius: number }) => {
    const moonRef = useRef<THREE.Mesh>(null);
    const pivotRef = useRef<THREE.Group>(null);

    const moonRadius = Math.max(0.14, earthRadius * 0.27);
    const moonDistance = earthRadius * 3.4;

    useFrame(({ clock }) => {
        const t = clock.getElapsedTime();
        if (pivotRef.current) pivotRef.current.rotation.y = t * 0.55;
        if (moonRef.current) moonRef.current.rotation.y += 0.01;
    });

    return (
        <group ref={pivotRef}>
            <mesh ref={moonRef} position={[moonDistance, 0, 0]} castShadow receiveShadow>
                <sphereGeometry args={[moonRadius, 32, 32]} />
                <meshStandardMaterial color="#d9d6cf" roughness={1} metalness={0} emissive="#000000" />
            </mesh>
        </group>
    );
};

export default SolarSystem;
