'use client';
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { Canvas, useFrame, useThree, } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';
import { Loader } from '@react-three/drei';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'
import { PLANETS } from '@/constants/solarSystem.constants';
import { PlanetProps } from '../../../globals';

// Utility to load textures
const useTexture = (path?: string) => {
    return useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);
};

// Main Solar System Component
const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState<boolean>(false);
    const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);
    const [focusPosition, setFocusPosition] = useState<THREE.Vector3 | null>(null);

    const controlsRef = useRef<any>(null); // Reference to OrbitControls

    const toggleCameraRotation = () => {
        setIsCameraRotationEnabled((prev) => !prev);
    };

    return (
        <div className='relative'>
            <Canvas camera={{ position: [0, 10, 200] }} style={{ height: '100vh' }} shadows>
                {/* Effects */}
                <color attach='background' args={['#111']} />
                {/* <EffectComposer>
                    <Bloom mipmapBlur luminanceThreshold={1} intensity={1.5} />
                    <ToneMapping />
                </EffectComposer> */}

                {/* Lighting */}
                <ambientLight intensity={0.1} />
                <pointLight
                    position={[0, 0, 0]} // Sun's position
                    intensity={3}
                    castShadow
                    shadow-mapSize={{ width: 1024, height: 1024 }}
                />
                <directionalLight
                    position={[0, 20, 20]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={{ width: 1024, height: 1024 }}
                />

                {/* Stars and Background */}
                <Stars radius={200} depth={80} count={5000} factor={5} />
                <BackgroundSphere texturePath='/solar-system.png' />

                {/* Solar System Scene */}
                <SolarSystemScene
                    setFocusPosition={setFocusPosition}
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                />
                {/* Camera Controls */}
                <CameraController isCameraRotationEnabled={isCameraRotationEnabled} focusPosition={focusPosition} />


                {/* Controls */}
                <OrbitControls ref={controlsRef} maxDistance={1500} minDistance={30} target={[0, 0, 0]} />
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
    const texture = useTexture(texturePath);

    return (
        <mesh>
            <sphereGeometry args={[600, 120, 120]} />
            <meshBasicMaterial map={texture} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
    );
};


// Camera Controller Component
const CameraController = ({ focusPosition, isCameraRotationEnabled }: { focusPosition: THREE.Vector3 | null, isCameraRotationEnabled: boolean }) => {
    const { camera, gl, scene } = useThree();
    const [targetPosition, setTargetPosition] = useState<THREE.Vector3 | null>(null);

    useEffect(() => {
        if (focusPosition) {
            // Update the target position to the focus point with an added offset for zoom
            setTargetPosition(focusPosition.clone().setLength(focusPosition.length() + 20)); // You can adjust this offset as necessary
        }
    }, [focusPosition]);

    useFrame(() => {
        if (targetPosition && isCameraRotationEnabled && focusPosition) {
            camera.position.lerp(targetPosition, 0.1); // Smooth transition
            // camera.lookAt(focusPosition); // Keep the camera looking at the planet
            scene.lookAt(focusPosition)
        }
    });

    useEffect(() => {
        if (focusPosition) {
            // Update OrbitControls' target when the focus changes
            gl.domElement.dispatchEvent(new Event('focus')); // Refresh controls on focus change
        }
    }, [focusPosition, gl]);

    return null;
};

// Solar System Scene
const SolarSystemScene = ({
    setSelectedPlanet,
    isCameraRotationEnabled,
    setFocusPosition,
}: {
    setSelectedPlanet: (planetName: string) => void;
    isCameraRotationEnabled: boolean;
    setFocusPosition: (position: THREE.Vector3 | null) => void
}) => {
    const sunRef = useRef<THREE.Mesh>(null);
    useFrame(() => {
        if (sunRef.current) sunRef.current.rotation.y += 0.005; // Rotate Sun
    });

    const handleSetFocusPosition = useCallback((position: THREE.Vector3 | null) => {
        // Set the focus position for the CameraController
        setFocusPosition(position)
    }, []);

    return (
        <>
            {/* Sun */}
            <mesh ref={sunRef} position={[0, 0, 0]} onClick={(ref) => setFocusPosition(null)}>
                <sphereGeometry args={[32, 32, 32]} />
                <meshStandardMaterial emissive="white" emissiveIntensity={5} />
            </mesh>

            {/* Generate Planets */}
            {PLANETS.map((planet) => (
                <Planet
                    key={planet.name}
                    {...planet}
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                    setFocusPosition={handleSetFocusPosition} // Pass the focusPosition function
                />
            ))}
        </>
    );
};

// Utility function to calculate orbital positions
const calculateOrbitPosition = (time: number, distance: number) => {
    return {
        x: Math.cos(time) * distance,
        z: Math.sin(time) * distance,
    };
};

// Planet Component
const Planet: React.FC<PlanetProps & {
    hasRings?: boolean;
    setSelectedPlanet: (planetName: string) => void;
    isCameraRotationEnabled: boolean;
    setFocusPosition: (position: THREE.Vector3) => void;
}> = ({ name, radius, distance, speed, color, texture, hasRings, setSelectedPlanet, isCameraRotationEnabled, setFocusPosition }) => {
    const planetRef: any = useRef<THREE.Mesh>(null);
    const planetTexture = useTexture(texture);

    // Update planet position in orbit
    useFrame(({ clock }) => {
        if (isCameraRotationEnabled && planetRef.current) {
            const time = clock.getElapsedTime() * speed;
            const { x, z } = calculateOrbitPosition(time, distance);
            planetRef.current.position.set(x, 0, z);
        }
    });

    const handleClick = (e: any) => {
        e.stopPropagation(); // Prevents triggering both planet and rings click.
        setSelectedPlanet(name);
        if (planetRef.current) {
            setFocusPosition(planetRef.current.position); // Set the focus position
        }
    };

    return (
        <group ref={planetRef} onClick={handleClick}>
            {/* Planet */}
            <mesh castShadow receiveShadow frustumCulled>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    map={planetTexture || null}
                    color={color || 'white'}
                    roughness={0.5}
                    metalness={0.3}
                />
            </mesh>

            {/* Rings (if any) */}
            {hasRings && <PlanetRings radius={radius} />}
        </group>
    );
};

// Planet Rings Component
const PlanetRings = ({ radius }: { radius: number }) => (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
        <meshBasicMaterial color="gold" side={THREE.DoubleSide} />
    </mesh>
);

export default SolarSystem;
