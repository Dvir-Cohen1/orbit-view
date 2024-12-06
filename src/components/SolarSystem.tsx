'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Text, TrackballControls } from '@react-three/drei';
import { Mesh } from 'three';
import Sun from './Sun';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing';

// import Sun from '../Sun';
// import Saturn from '../Saturn';
// import Jupiter from '../Jupiter';
// import Earth from '../Earth';

const SolarSystem = () => {
    return (
        <div className='relative'>
            <Canvas
                camera={{ position: [0, 0, 0] }}
                fallback={<div>Sorry no WebGL supported!</div>}
                style={{ height: '100vh' }}
                shadows={true}
            >
                {/* Glow Effect */}
                <color attach='background' args={['#111']} />
                <EffectComposer enableNormalPass>
                    <Bloom mipmapBlur luminanceThreshold={1} levels={9} intensity={1.5} />
                    <ToneMapping />
                </EffectComposer>

                {/* Lights */}
                {/* <ambientLight intensity={0.1} /> */}
                <pointLight
                    position={[0, 0, 0]} // Sun's position
                    intensity={1.5}
                    castShadow
                    shadow-mapSize-width={1024}
                    shadow-mapSize-height={1024}
                />

                {/* Background */}
                <BackgroundSphere texturePath='/solar-system.png' />

                {/* Stars */}
                <Stars radius={200} depth={80} count={5000} factor={5} />

                {/* Solar System Scene */}
                <SolarSystemScene />
                {/* Orbit Controls */}
                <OrbitControls
                    makeDefault
                    // dollySpeed={0.1}
                    maxDistance={1500}
                    minDistance={25}
                    target={[2, -2, 0]}
                    // autoRotate
                />
                <Environment preset='night' />
            </Canvas>
        </div>
    );
};

const BackgroundSphere = ({ texturePath }: { texturePath: string }) => {
    const texture = new THREE.TextureLoader().load(texturePath);

    return (
        <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[600, 120, 120]} />
            <meshBasicMaterial
                map={texture}
                side={THREE.DoubleSide}
                depthWrite={false}
            />
        </mesh>
    );
};

const SolarSystemScene = () => {
    const sunRef = useRef<Mesh>(null);

    useFrame(() => {
        if (sunRef.current) {
            sunRef.current.rotation.y += 0.005; // Sun rotation
        }
    });

    return (
        <>
            <mesh ref={sunRef} position={[0, 0, 0]} scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[20, 20, 20]} />
                <meshStandardMaterial color={'yellow'} emissive={'white'} emissiveIntensity={3} />
            </mesh>

            {/* Planets */}
            <Planet name='Mercury' radius={0.4} distance={20} speed={1} color='gray' />
            <Planet name='Venus' radius={0.8} distance={70} speed={0.2} color='yellow' />
            <Planet name='Earth' radius={1} distance={100} speed={0.045} color='blue' />
            <Planet name='Mars' radius={2} distance={130} speed={0.055} color='#CF803B' />
            <Planet name='Jupiter' radius={5} distance={250} speed={0.02} />
            <Planet name='Saturn' radius={4} distance={370} speed={0.018} />
            <Planet name='Pluto' radius={0.4} distance={450} speed={0.008} color='red' />
            <Planet name='Neptune' radius={0.3} distance={550} speed={0.008} />
        </>
    );
};

interface PlanetProps {
    name: string;
    radius: number;
    distance: number;
    speed: number;
    color?: string; // Optional, used for generic planets
    customModel?: React.ReactNode; // Optional, for custom 3D models
}

const Planet: React.FC<PlanetProps> = ({ name, radius, distance, speed, color, customModel }) => {
    const planetRef: any = useRef<Mesh>(null);

    useFrame(({ clock }) => {
        if (planetRef.current) {
            planetRef.current.position.x = Math.cos(clock.getElapsedTime() * speed) * distance;
            planetRef.current.position.z = Math.sin(clock.getElapsedTime() * speed) * distance;
        }
    });

    return (
        <group ref={planetRef}>
            {/* Render the custom model if provided, otherwise use a generic sphere */}
            {customModel || (
                <mesh name={name}>
                    <sphereGeometry args={[radius, 32, 32]} />
                    <meshStandardMaterial color={color || 'white'} />
                </mesh>
            )}
        </group>
    );
};

export default SolarSystem;