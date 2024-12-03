'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Text, TrackballControls } from '@react-three/drei';
import { Mesh } from 'three';
import Sun from './Sun';
// import Sun from '../Sun';
// import Saturn from '../Saturn';
// import Jupiter from '../Jupiter';
// import Earth from '../Earth';

const SolarSystem = () => {
     return (
          <div className="relative">
               <Canvas
                    fallback={<div>Sorry no WebGL supported!</div>}
                    style={{ height: '100vh' }}
                    camera={{ position: [50, 0, 50], fov: 75 }}
                    // dpr={[1, 2]} camera={{ position: [0, 0, 35], fov: 90 }}
                    shadows // Enable shadows globally
               >
                    <ambientLight intensity={0.1} />
                    {/* Point light acts as the sun */}
                    <pointLight
                         position={[0, 0, 0]} // Position at the Sun's location
                         intensity={1} // Adjust the intensity as needed
                         castShadow
                         shadow-mapSize-width={1024}
                         shadow-mapSize-height={1024}
                         shadow-radius={100}
                    />
                    <Environment preset="night" />
                    <Stars radius={200} depth={180} count={5000} factor={4} />
                    <SolarSystemScene />
                    <OrbitControls />
                    <TrackballControls />
               </Canvas>
          </div>
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
               {/* Sun */}
               <mesh ref={sunRef} position={[0, 0, 0]} scale={[5, 5, 5]}>
                    <Sun />
               </mesh>

               {/* Planets */}
               <Planet name="Mercury" radius={0.4} distance={60} speed={0.08} color="gray" />
               <Planet name="Venus" radius={0.8} distance={70} speed={0.028} color="yellow" />
               <Planet name="Earth" radius={1} distance={100} speed={0.015} color="blue" />
               <Planet name="Mars" radius={2} distance={130} speed={0.015} color="#CF803B" />
               <Planet name="Jupiter" radius={1.5} distance={250} speed={0.08} />
               <Planet name="Saturn" radius={1.5} distance={370} speed={0.008} />
          </>
     );
};

interface PlanetProps {
     name: string;
     radius: number;
     distance: number;
     speed: number;
     color?: string; // Optional, used for generic planets
     customModel?: React.ReactNode; // Optional, for custom 3D models like Saturn
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
                    <mesh>
                         <sphereGeometry args={[radius, 32, 32]} />
                         <meshStandardMaterial color={color || 'white'} />
                    </mesh>
               )}

          </group>
     );
};

export default SolarSystem;
