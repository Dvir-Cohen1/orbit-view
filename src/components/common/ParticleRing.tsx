'use client';
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    Environment,
    OrbitControls,
    Sphere,
    RoundedBox,
    CameraShake,
    SpotLight,
} from '@react-three/drei';
import { pointsInner, pointsOuter } from '@/lib/particals.utils';
import Moon from '../Moon';

const ParticleRing = () => {
    return (
        <div className='relative'>
            <Canvas
                camera={{
                    position: [100, -7.5, -95],
                }}
                style={{ height: '100vh' }}
                //  className='bg-slate-900'
            >
                {/* <pointLight position={[-300, 10, -60]} power={6.0} /> */}
                <OrbitControls maxDistance={85} minDistance={2} />
                <directionalLight castShadow position={[2.5, 8, 5]} shadow-mapSize={[1024, 1024]}>
                    <orthographicCamera attach='shadow-camera' args={[-10, 10, 10, -10]} />
                </directionalLight>
                <PointCircle />
                <SpotLight position={[100, 1000, 100]} />
                <Environment preset='sunset' />
            </Canvas>

            {/* <h1 className='pointer-events-none absolute left-[50%] top-[50%] -translate-x-[50%] -translate-y-[50%] text-2xl font-medium text-slate-200 md:text-5xl'>
                Drag & Zoom
            </h1> */}
        </div>
    );
};

const PointCircle = () => {
    const ref1: any = useRef(null);
    const ref2: any = useRef(null);

    useFrame(({ clock }) => {
        if (ref1.current?.rotation) {
            ref1.current.rotation.z = clock.getElapsedTime() * 0.05;
        }
    });

    useFrame(({ clock }) => {
        if (ref2.current?.rotation) {
            // ref2.current.rotation.z = clock.getElapsedTime() * 0.9;
            ref2.current.rotation.x = clock.getElapsedTime() * 0.09;
            ref2.current.rotation.y = clock.getElapsedTime() * 0.09;
            // ref1.current.rotation.z = clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <>
            <group ref={ref1}>
                <group ref={ref2} position-x={-15} position-y={5}>
                    <Moon scale={10} />
                </group>
                {pointsInner.map((point) => (
                    <Point key={point.idx} position={point.position} color={point.color} />
                ))}
                {pointsOuter.map((point) => (
                    <Point key={point.idx} position={point.position} color={point.color} />
                ))}
            </group>
        </>
    );
};

const Point = ({ position, color }: any) => {
    return (
        <Sphere position={position} args={[0.1, 40, 10]}>
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.7}
                roughness={1.5}
                color={color}
            />
        </Sphere>
    );
};

export default ParticleRing;
