'use client';
import React, { useState, useRef, useMemo } from 'react';
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
    return useMemo(() => (path ? new THREE.TextureLoader().load(path) : undefined), [path]);
};

// Main Solar System Component
const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState<boolean>(false);
    const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);


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
                    shadow-mapSize={{ width: 2048, height: 2048 }}
                />
                <directionalLight
                    position={[0, 20, 20]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={{ width: 2048, height: 2048 }}
                />

                {/* Stars and Background */}
                <Stars radius={200} depth={80} count={5000} factor={5} />
                <BackgroundSphere texturePath='/solar-system.png' />

                {/* Solar System Scene */}
                <SolarSystemScene
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                />
                {/* Camera Controls */}
                <CameraController isCameraRotationEnabled={isCameraRotationEnabled} focusPosition={null} />


                {/* Controls */}
                <OrbitControls maxDistance={1500} minDistance={30} target={[0, 0, 0]} />
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
    const { camera } = useThree();

    useFrame(() => {
        if (focusPosition && isCameraRotationEnabled) {
            camera.position.lerp(focusPosition.clone().setLength(focusPosition.length() + 20), 0.1);
            camera.lookAt(focusPosition);
        }
    });

    return null;
};

// Solar System Scene
const SolarSystemScene = ({
    setSelectedPlanet,
    isCameraRotationEnabled,
}: {
    setSelectedPlanet: (planetName: string) => void;
    isCameraRotationEnabled: boolean;
}) => {
    const sunRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (sunRef.current) sunRef.current.rotation.y += 0.005; // Rotate Sun
    });

    return (
        <>
            {/* Sun */}
            <mesh ref={sunRef} position={[0, 0, 0]}>
                <sphereGeometry args={[20, 32, 32]} />
                <meshStandardMaterial emissive="white" emissiveIntensity={5} />
            </mesh>

            {/* Generate Planets */}
            {PLANETS.map((planet) => (
                <Planet
                    key={planet.name}
                    {...planet}
                    setSelectedPlanet={setSelectedPlanet}
                    isCameraRotationEnabled={isCameraRotationEnabled}
                />
            ))}
        </>
    );
};

// Planet Component
const Planet: React.FC<
    PlanetProps & {
        hasRings?: boolean;
        setSelectedPlanet: (planetName: string) => void;
        isCameraRotationEnabled: boolean;
    }
> = ({ name, radius, distance, speed, color, texture, hasRings, setSelectedPlanet, isCameraRotationEnabled }) => {
    const planetRef: any = useRef<THREE.Mesh>(null);
    const planetTexture = useTexture(texture);

    useFrame(({ clock }) => {
        if (isCameraRotationEnabled) {
            const time = clock.getElapsedTime() * speed;
            if (planetRef.current) {
                planetRef.current.position.x = Math.cos(time) * distance;
                planetRef.current.position.z = Math.sin(time) * distance;
            }
        }
    });

    const handleClick = () => {
        setSelectedPlanet(name);
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
            {hasRings && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
                    <meshBasicMaterial color="gold" side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
};

export default SolarSystem;
