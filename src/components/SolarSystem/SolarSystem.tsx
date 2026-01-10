// SolarSystem.tsx
'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
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

const useTexture = (path?: string) =>
    useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);

type FocusTarget =
    | { type: 'sun' }
    | { type: 'planet'; name: string }
    | null;

type PlanetPositionStore = Record<string, THREE.Vector3>;

const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [focusedTarget, setFocusedTarget] = useState<FocusTarget>({ type: 'sun' }); // ✅ initial = sun
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

    return (
        <div className="relative">
            <Canvas camera={{ position: [0, 10, 200], near: 0.1, far: 5000 }} style={{ height: '100vh' }} shadows>
                <color attach="background" args={['#0D1117']} />

                <EffectComposer>
                    <Bloom mipmapBlur luminanceThreshold={1} intensity={1.5} />
                    <ToneMapping />
                </EffectComposer>

                <ambientLight intensity={0.05} />
                <pointLight position={[0, 0, 0]} intensity={2} castShadow />
                <directionalLight position={[0, 20, 20]} intensity={1} castShadow />

                <Stars radius={200} depth={80} count={5000} factor={4} />
                <BackgroundSphere texturePath="/solar-system.png" />

                <SolarSystemScene
                    setSelectedPlanet={setSelectedPlanet}
                    setFocusedTarget={setFocusedTarget}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    selectedPlanet={selectedPlanet}
                    focusedTarget={focusedTarget}
                    onPlanetPosition={updatePlanetPosition}
                />

                <CameraController
                    controlsRef={controlsRef}
                    focusedTarget={focusedTarget}
                    getPlanetPosition={getPlanetPosition}
                    getPlanetRadius={(name) => planetsByName.get(name)?.radius ?? 1}
                />

                <OrbitControls
                    ref={controlsRef}
                    maxDistance={1500}
                    minDistance={30}
                    enableDamping
                    dampingFactor={0.08}
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

const BackgroundSphere = ({ texturePath }: { texturePath: string }) => {
    const texture = useTextureDrei(texturePath);
    return (
        <mesh>
            <sphereGeometry args={[600, 120, 120]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
};

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
    const tmpDir = useMemo(() => new THREE.Vector3(), []);
    const tmpDesiredPos = useMemo(() => new THREE.Vector3(), []);

    useFrame(() => {
        if (!focusedTarget) return;

        let desiredDistance = 220;

        if (focusedTarget.type === 'sun') {
            tmpTarget.set(0, 0, 0);
            desiredDistance = 220;
        } else {
            const live = getPlanetPosition(focusedTarget.name);
            if (!live) return;

            tmpTarget.copy(live);
            desiredDistance = Math.max(20, getPlanetRadius(focusedTarget.name) * 14);
        }

        tmpDir.copy(camera.position).sub(tmpTarget);
        if (tmpDir.lengthSq() < 1e-6) tmpDir.set(0, 10, desiredDistance);
        tmpDir.normalize();

        tmpDesiredPos.copy(tmpTarget).add(tmpDir.multiplyScalar(desiredDistance));
        camera.position.lerp(tmpDesiredPos, 0.12);

        const controls = controlsRef.current;
        if (controls) {
            controls.target.lerp(tmpTarget, 0.18);
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
            {/* ✅ Click Sun => focus Sun */}
            <mesh
                ref={sunRef}
                position={[0, 0, 0]}
                onClick={() => {
                    setFocusedTarget({ type: 'sun' });
                    setSelectedPlanet(null);
                }}
            >
                <sphereGeometry args={[32, 32, 32]} />
                <meshStandardMaterial emissive="white" emissiveIntensity={5} />
            </mesh>

            {PLANETS.map((planet) => (
                <mesh key={`${planet.name}-orbit`} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.distance - 0.2, planet.distance + 0.2, 128]} />
                    <meshBasicMaterial color="#333" side={THREE.DoubleSide} transparent opacity={0.4} />
                </mesh>
            ))}

            {PLANETS.map((planet) => (
                <Planet
                    key={planet.name}
                    {...planet}
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
    hasRings,
    setSelectedPlanet,
    setFocusedTarget,
    isCameraRotationEnabled,
    selectedPlanet,
    focusedTarget,
    onPlanetPosition,
}: PlanetProps & {
    hasRings?: boolean;
    setSelectedPlanet: (planetName: string | null) => void;
    setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
    isCameraRotationEnabled: boolean;
    selectedPlanet: string | null;
    focusedTarget: FocusTarget;
    onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const planetTexture = useTexture(texture);

    useCursor(hovered);

    const tmpWorld = useMemo(() => new THREE.Vector3(), []);

    useFrame(({ clock }) => {
        const g = groupRef.current;
        if (!g) return;

        if (isCameraRotationEnabled) {
            const time = clock.getElapsedTime() * speed;
            const { x, z } = calculateOrbitPosition(time, distance);
            g.position.set(x, 0, z);
        }

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
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    map={planetTexture || null}
                    color={color || 'white'}
                    emissive={isFocused ? 'white' : color || 'white'}
                    emissiveIntensity={isFocused ? 0.7 : 0.1}
                />
            </mesh>

            {hasRings && <PlanetRings radius={radius} />}
        </group>
    );
};

const PlanetRings = ({ radius }: { radius: number }) => (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
        <meshBasicMaterial color="gold" side={THREE.DoubleSide} />
    </mesh>
);

export default SolarSystem;
