'use client';
import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';

// Utility to load textures
const useTexture = (path?: string) => {
    return useMemo(() => (path ? new THREE.TextureLoader().load(path) : undefined), [path]);
};

// Planet Data
export const PLANETS = [
    {
        name: 'Mercury',
        radius: 0.5,
        distance: 30,
        speed: 1,
        color: 'gray',
        details: 'Smallest planet in our solar system',
        icon: '/planets/mercury.png',
    },
    {
        name: 'Venus',
        radius: 0.9,
        distance: 50,
        speed: 0.5,
        color: 'orange',
        details: 'Known as Earth’s twin',
        icon: '/planets/venus.png',
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 80,
        speed: 0.3,
        color: 'blue',
        details: 'Home to life',
        icon: '/planets/earth.png',
    },
    {
        name: 'Mars',
        radius: 0.8,
        distance: 100,
        speed: 0.25,
        color: 'red',
        details: 'The Red Planet',
        icon: '/planets/mars.png',
    },
    {
        name: 'Jupiter',
        radius: 4,
        distance: 150,
        speed: 0.1,
        details: 'Largest planet in our solar system',
        icon: '/planets/jupiter.png',
    },
    {
        name: 'Saturn',
        radius: 3.5,
        distance: 200,
        speed: 0.09,
        color: 'goldenrod',
        hasRings: true,
        details: 'Famous for its rings',
        icon: '/planets/saturn.png',
    },
    {
        name: 'Uranus',
        radius: 3,
        distance: 250,
        speed: 0.08,
        color: 'lightblue',
        details: 'It rotates on its side',
        icon: '/planets/uranus.png',
    },
    {
        name: 'Neptune',
        radius: 3,
        distance: 300,
        speed: 0.07,
        color: 'blue',
        details: 'The farthest planet',
        icon: '/planets/neptune.png',
    },
    {
        name: 'Pluto',
        radius: 0.4,
        distance: 350,
        speed: 0.05,
        color: 'white',
        details: 'Dwarf planet',
        icon: '/planets/pluto.png',
    },
];

// Main Solar System Component
const SolarSystem = () => {
    const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
    const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState<boolean>(false);

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
                <pointLight
                    position={[0, 0, 0]} // Sun's position
                    intensity={3}
                    castShadow
                    shadow-mapSize={{ width: 2048, height: 2048 }}
                />

                {/* Stars and Background */}
                <Stars radius={200} depth={80} count={5000} factor={5} />
                <BackgroundSphere texturePath='/solar-system.png' />

                {/* Solar System Scene */}
                <SolarSystemScene setSelectedPlanet={setSelectedPlanet} />

                {/* Controls */}
                <OrbitControls maxDistance={1500} minDistance={50} target={[0, 0, 0]} />
                <Environment preset='night' />
            </Canvas>

            {/* Planet Popup */}
            <PlanetMenu
                selectedPlanet={selectedPlanet}
                isPlanetMenuOpen={isPlanetMenuOpen}
                setIsPlanetMenuOpen={setIsPlanetMenuOpen}
                setSelectedPlanet={setSelectedPlanet}
            />
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

// Solar System Scene
const SolarSystemScene = ({
    setSelectedPlanet,
}: {
    setSelectedPlanet: (planetName: string) => void;
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
                <meshStandardMaterial emissive='white' emissiveIntensity={5} />
            </mesh>

            {/* Generate Planets */}
            {PLANETS.map((planet) => (
                <Planet key={planet.name} {...planet} setSelectedPlanet={setSelectedPlanet} />
            ))}
        </>
    );
};

// Planet Component
const Planet: React.FC<
    PlanetProps & { hasRings?: boolean; setSelectedPlanet: (planetName: string) => void }
> = ({ name, radius, distance, speed, color, texture, hasRings, setSelectedPlanet }) => {
    const planetRef: any = useRef<THREE.Mesh>(null);
    const planetTexture = useTexture(texture);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime() * speed;
        if (planetRef.current) {
            planetRef.current.position.x = Math.cos(time) * distance;
            planetRef.current.position.z = Math.sin(time) * distance;
        }
    });

    // Handle Click Event to Show Planet Details
    const handleClick = () => {
        setSelectedPlanet(name);
    };

    return (
        <group ref={planetRef} onClick={handleClick}>
            {/* Planet */}
            <mesh castShadow receiveShadow>
                <sphereGeometry args={[radius, 64, 64]} />
                <meshStandardMaterial
                    map={planetTexture}
                    color={color || 'white'}
                    roughness={0.5}
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
