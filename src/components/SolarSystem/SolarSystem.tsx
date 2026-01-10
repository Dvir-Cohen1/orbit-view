'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Loader } from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';
import { PLANETS } from '@/constants/solarSystem.constants';
import { PlanetProps } from '../../../globals';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'; // 👈 add this
import { useCursor } from '@react-three/drei';
import { useTexture as useTextureDrei } from '@react-three/drei';
// Utility: Load textures
const useTexture = (path?: string) =>
    useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);

// Main Solar System Component
const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState(false);
    const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);
    const [focusPosition, setFocusPosition] = useState<THREE.Vector3 | null>(null);
    // const controlsRef = useRef<any>(null);

    const controlsRef = useRef<OrbitControlsImpl | null>(null); // 👈 type it properly


    const toggleCameraRotation = () => setIsCameraRotationEnabled((prev) => !prev);

    return (
        <div className='relative'>
            <Canvas camera={{ position: [0, 10, 200] }} style={{ height: '100vh' }} shadows>
                {/* Scene Background */}
                <color attach='background' args={['#0D1117']} />

                <EffectComposer>
                    <Bloom mipmapBlur luminanceThreshold={1} intensity={1.5} />
                    <ToneMapping />
                </EffectComposer>

                {/* Lighting */}
                <ambientLight intensity={0.05} />
                <pointLight position={[0, 0, 0]} intensity={2} castShadow />
                <directionalLight position={[0, 20, 20]} intensity={1} castShadow />

                {/* Stars & Background */}
                <Stars radius={200} depth={80} count={5000} factor={4} />
                <BackgroundSphere texturePath='/solar-system.png' />

                {/* Solar System */}
                <SolarSystemScene
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    setFocusPosition={setFocusPosition}
                    selectedPlanet={selectedPlanet}
                />

                {/* Camera & Controls */}
                <CameraController
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    focusPosition={focusPosition}
                    controlsRef={controlsRef}
                />
                <OrbitControls
                    ref={controlsRef}
                    maxDistance={1500}
                    minDistance={30}
                    target={[0, 0, 0]}
                />
                <Environment preset='night' />
            </Canvas>

            {/* Planet Menu */}
            <PlanetMenu
                selectedPlanet={selectedPlanet}
                isPlanetMenuOpen={isPlanetMenuOpen}
                setIsPlanetMenuOpen={setIsPlanetMenuOpen}
                setSelectedPlanet={setSelectedPlanet}
                toggleCameraRotation={toggleCameraRotation}
                isCameraRotationEnabled={isCameraRotationEnabled}
                setFocusPosition={setFocusPosition}
            />
            <Loader />
        </div>
    );
};

// Background Sphere Component
const BackgroundSphere = ({ texturePath }: { texturePath: string }) => {
    const texture = useTextureDrei(texturePath);
    return (
        <mesh>
            <sphereGeometry args={[600, 120, 120]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
};

// Camera Controller
const CameraController = ({
    focusPosition,
    isCameraRotationEnabled,
    controlsRef,
}: {
    focusPosition: THREE.Vector3 | null;
    isCameraRotationEnabled: boolean;
    controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) => {
    const { camera } = useThree();

    useFrame(() => {
        if (!focusPosition || !isCameraRotationEnabled) return;

        // Where we want the camera to end up
        const target = focusPosition;
        const desiredCameraPos = target.clone().setLength(target.length() + 20);

        // Smooth camera move
        camera.position.lerp(desiredCameraPos, 0.1);
        camera.lookAt(target);

        // 👇 keep OrbitControls' target in sync with the planet
        if (controlsRef.current) {
            controlsRef.current.target.lerp(target, 0.1);
            controlsRef.current.update();
        }
    });


    return null;
};

// Solar System Scene
const SolarSystemScene = ({
    setSelectedPlanet,
    isCameraRotationEnabled,
    setFocusPosition,
    selectedPlanet
}: {
    setSelectedPlanet: (planetName: string) => void;
    isCameraRotationEnabled: boolean;
    setFocusPosition: (position: THREE.Vector3 | null) => void;
    selectedPlanet: any
}) => {
    const sunRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (sunRef.current) sunRef.current.rotation.y += 0.005; // Rotate Sun
    });

    return (
        <>
            {/* Sun */}
            <mesh ref={sunRef} position={[0, 0, 0]} onClick={() => setFocusPosition(null)}>
                <sphereGeometry args={[32, 32, 32]} />
                <meshStandardMaterial emissive='white' emissiveIntensity={5} />
            </mesh>
            {PLANETS.map((planet) => (
                <mesh key={`${planet.name}-orbit`} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.distance - 0.2, planet.distance + 0.2, 128]} />
                    <meshBasicMaterial color='#333' side={THREE.DoubleSide} transparent opacity={0.4} />
                </mesh>
            ))}

            {/* Planets */}
            {PLANETS.map((planet) => (
                <Planet
                    key={planet.name}
                    {...planet}
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    setFocusPosition={setFocusPosition}
                    selectedPlanet={selectedPlanet}
                />
            ))}
            {/* {PLANETS.map((planet) => (
                <mesh key={`${planet.name}-orbit`} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[planet.distance - 0.2, planet.distance + 0.2, 128]} />
                    <meshBasicMaterial color='#333' side={THREE.DoubleSide} transparent opacity={0.4} />
                </mesh>
            ))} */}
        </>
    );
};

// Utility: Calculate orbital positions
const calculateOrbitPosition = (time: number, distance: number) => ({
    x: Math.cos(time) * distance,
    z: Math.sin(time) * distance,
});

// Planet Component
// const Planet = ({
//     name,
//     radius,
//     distance,
//     speed,
//     color,
//     texture,
//     hasRings,
//     setSelectedPlanet,
//     isCameraRotationEnabled,
//     setFocusPosition,
// }: PlanetProps & {
//     hasRings?: boolean;
//     setSelectedPlanet: (planetName: string) => void;
//     isCameraRotationEnabled: boolean;
//     setFocusPosition: (position: THREE.Vector3) => void;
// }) => {
//     const planetRef: any = useRef<THREE.Mesh>(null);
//     const planetTexture = useTexture(texture);

//     useFrame(({ clock }) => {
//         if (isCameraRotationEnabled && planetRef.current) {
//             const time = clock.getElapsedTime() * speed;
//             const { x, z } = calculateOrbitPosition(time, distance);
//             planetRef.current.position.set(x, 0, z);
//         }
//     });

//     const handleClick = () => {
//         if (planetRef.current) {
//             setSelectedPlanet(name);
//             setFocusPosition(planetRef.current.position);
//         }
//     };

//     return (
//         <group ref={planetRef} onClick={handleClick}>
//             <mesh castShadow receiveShadow>
//                 <sphereGeometry args={[radius, 64, 64]} />
//                 <meshStandardMaterial
//                     map={planetTexture || null}
//                     color={color || 'white'}
//                 // roughness={0.5}
//                 // metalness={0.3}
//                 // emissive='blue' emissiveIntensity={5}
//                 />
//             </mesh>
//             {hasRings && <PlanetRings radius={radius} />}
//         </group>
//     );
// };

const Planet = ({
    name,
    radius,
    distance,
    speed,
    color,
    texture,
    hasRings,
    setSelectedPlanet,
    isCameraRotationEnabled,
    setFocusPosition,
    selectedPlanet,        // 👈 add this prop
}: PlanetProps & {
    hasRings?: boolean;
    setSelectedPlanet: (planetName: string) => void;
    isCameraRotationEnabled: boolean;
    setFocusPosition: (position: THREE.Vector3) => void;
    selectedPlanet: string | null;
}) => {
    const planetRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const planetTexture = useTexture(texture);

    useCursor(hovered);

    useFrame(({ clock }) => {
        if (isCameraRotationEnabled && planetRef.current) {
            const time = clock.getElapsedTime() * speed;
            const { x, z } = calculateOrbitPosition(time, distance);
            planetRef.current.position.set(x, 0, z);
        }
    });

    const handleClick = () => {
        if (!planetRef.current) return;
        setSelectedPlanet(name);
        setFocusPosition(planetRef.current.position);
    };

    const isSelected = selectedPlanet === name;
    const scale = isSelected ? 1.3 : hovered ? 1.15 : 1;

    return (
        <group
            ref={planetRef}
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
                    emissive={isSelected ? 'white' : color || 'white'}
                    emissiveIntensity={isSelected ? 0.6 : 0.1}
                />
            </mesh>
            {hasRings && <PlanetRings radius={radius} />}
        </group>
    );
};

// Planet Rings Component
const PlanetRings = ({ radius }: { radius: number }) => (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
        <meshBasicMaterial color='gold' side={THREE.DoubleSide} />
    </mesh>
);

const PlanetFocusSphere = ({ radius }: { radius: number }) => (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
        <meshBasicMaterial color='gray' side={THREE.DoubleSide} />
    </mesh>
);

export default SolarSystem;
