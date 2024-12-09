'use client';
import React, { useState, useRef, useMemo } from 'react';
import { Canvas, useFrame, } from '@react-three/fiber';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';
import { Loader } from '@react-three/drei';

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
        details: 'The smallest and fastest planet in our solar system, closest to the Sun.',
        icon: '/planets/mercury.png',
    },
    {
        name: 'Venus',
        radius: 0.9,
        distance: 50,
        speed: 0.5,
        color: 'orange',
        details: 'The second planet from the Sun, known for its extreme heat and thick atmosphere.',
        icon: '/planets/venus.png',
    },
    {
        name: 'Earth',
        radius: 1,
        distance: 80,
        speed: 0.3,
        color: 'blue',
        details: 'Our home planet, the only known planet to support life.',
        icon: '/planets/earth.png',
    },
    {
        name: 'Mars',
        radius: 0.8,
        distance: 100,
        speed: 0.25,
        color: 'red',
        details: 'The Red Planet, known for its iron oxide-rich soil.',
        icon: '/planets/mars.png',
    },
    {
        name: 'Jupiter',
        radius: 4,
        distance: 150,
        speed: 0.1,
        details: 'The largest planet in our solar system, a gas giant with a Great Red Spot.',
        icon: '/planets/jupiter.png',
    },
    {
        name: 'Saturn',
        radius: 3.5,
        distance: 200,
        speed: 0.09,
        color: 'goldenrod',
        hasRings: true,
        details: 'Known for its prominent ring system, Saturn is the second-largest planet.',
        icon: '/planets/saturn.png',
    },
    {
        name: 'Uranus',
        radius: 3,
        distance: 250,
        speed: 0.08,
        color: 'lightblue',
        details: 'The planet with a unique sideways rotation and faint ring system.',
        icon: '/planets/uranus.png',
    },
    {
        name: 'Neptune',
        radius: 3,
        distance: 300,
        speed: 0.07,
        color: 'blue',
        details: 'The most distant planet from the Sun, known for its deep blue color.',
        icon: '/planets/neptune.png',
    },
    {
        name: 'Pluto',
        radius: 0.4,
        distance: 350,
        speed: 0.05,
        color: 'white',
        details: 'Once considered the ninth planet, Pluto is now classified as a dwarf planet.',
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
                <mesh rotation={[Math.PI / 2, 0, 0]} >
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
