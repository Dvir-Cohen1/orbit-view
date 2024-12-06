'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';

// Utility to load textures
const useTexture = (path?: string) => {
    return useMemo(() => (path ? new THREE.TextureLoader().load(path) : undefined), [path]);
};

// Planet Data
const PLANETS = [
    { name: 'Mercury', radius: 0.5, distance: 30, speed: 1, color: 'gray' },
    { name: 'Venus', radius: 0.9, distance: 50, speed: 0.5, color: 'orange' },
    { name: 'Earth', radius: 1, distance: 80, speed: 0.3, color: 'blue' },
    { name: 'Mars', radius: 0.8, distance: 100, speed: 0.25, color: 'red' },
    { name: 'Jupiter', radius: 4, distance: 150, speed: 0.1 },
    { name: 'Saturn', radius: 3.5, distance: 200, speed: 0.09, color: 'goldenrod', hasRings: true },
    { name: 'Uranus', radius: 3, distance: 250, speed: 0.08, color: 'lightblue' },
    { name: 'Neptune', radius: 3, distance: 300, speed: 0.07, color: 'blue' },
    { name: 'Pluto', radius: 0.4, distance: 350, speed: 0.05, color: 'white' },
];

// Main Solar System Component
const SolarSystem = () => (
    <div className='relative'>
        <Canvas
            camera={{ position: [0, 10, 200] }}
            fallback={<div>Sorry, no WebGL support!</div>}
            style={{ height: '100vh' }}
            shadows
        >
            {/* Effects */}
            <color attach='background' args={['#111']} />
            <EffectComposer>
                <Bloom mipmapBlur luminanceThreshold={1} intensity={1.5} />
                <ToneMapping />
            </EffectComposer>

            {/* Lighting */}
            <pointLight
                position={[0, 0, 0]} // Sun's position
                intensity={2}
                castShadow
                shadow-mapSize={{ width: 1024, height: 1024 }}
            />

            {/* Stars and Background */}
            <Stars radius={200} depth={80} count={5000} factor={5} />
            <BackgroundSphere texturePath='/solar-system.png' />

            {/* Solar System Scene */}
            <SolarSystemScene />

            {/* Controls */}
            <OrbitControls maxDistance={1500} minDistance={50} target={[0, 0, 0]} />
            <Environment preset='night' />
        </Canvas>
    </div>
);

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

// Solar System Scene
const SolarSystemScene = () => {
    const sunRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (sunRef.current) sunRef.current.rotation.y += 0.005; // Rotate Sun
    });

    return (
        <>
            {/* Sun */}
            <mesh ref={sunRef} position={[0, 0, 0]}>
                <sphereGeometry args={[20, 32, 32]} />
                <meshStandardMaterial emissive='white' emissiveIntensity={5} />
            </mesh>

            {/* Generate Planets */}
            {PLANETS.map((planet) => (
                <Planet key={planet.name} {...planet} />
            ))}
        </>
    );
};

// Planet Component
const Planet: React.FC<PlanetProps & { hasRings?: boolean }> = ({
    name,
    radius,
    distance,
    speed,
    color,
    texture,
    hasRings,
}) => {
    const planetRef: any = useRef<THREE.Mesh>(null);
    const planetTexture = useTexture(texture);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime() * speed;
        if (planetRef.current) {
            planetRef.current.position.x = Math.cos(time) * distance;
            planetRef.current.position.z = Math.sin(time) * distance;
        }
    });

    return (
        <group ref={planetRef}>
            {/* Planet */}
            <mesh name={name}>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial
                    map={planetTexture}
                    color={color || 'white'}
                    roughness={1}
                    metalness={0.3}
                />
            </mesh>

            {/* Rings (if any) */}
            {hasRings && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[radius * 1.2, radius * 1.6, 64]} />
                    <meshBasicMaterial color='gold' side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
};

// Props Interface
interface PlanetProps {
    name: string;
    radius: number;
    distance: number;
    speed: number;
    color?: string;
    texture?: string;
}

export default SolarSystem;
