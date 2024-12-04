'use client';

import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, Text, TrackballControls } from '@react-three/drei';
import { Mesh } from 'three';
import Sun from './Sun';
import * as THREE from 'three';
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'

// import Sun from '../Sun';
// import Saturn from '../Saturn';
// import Jupiter from '../Jupiter';
// import Earth from '../Earth';

const SolarSystem = () => {
     return (
          <div className="relative">
               <Canvas
                    camera={{ near: 0.1, position: [0, 0, 500], fov: 65 }}
                    // gl={{ toneMappingExposure: 0.5 }} // Adjust exposure to dim the scene

                    fallback={<div>Sorry no WebGL supported!</div>}
                    style={{ height: '100vh' }}
                    // camera={{ position: [50, 0, 50], fov: 75 }}
                    // dpr={[1, 2]} camera={{ position: [0, 0, 35], fov: 90 }}
                    shadows // Enable shadows globally
               >


                    {/* GLOW */}
                    {/* <color attach="background" args={['#111']} /> */}
                    {/* <ambientLight /> */}
                    <EffectComposer enableNormalPass>
                         <Bloom mipmapBlur luminanceThreshold={1} levels={9} intensity={1.50} />
                         <ToneMapping />
                    </EffectComposer>
                    {/* <Shape color="white" position={[-2, 0, 0]} scale={[50, 50, 50]}>
                         <planeGeometry args={[1.5, 1.5]} />
                    </Shape> */}

                    {/* Lights */}
                    <ambientLight intensity={0.1} />
                    <pointLight
                         position={[0, 0, 0]} // Sun's position
                         intensity={100}
                         castShadow
                         shadow-mapSize-width={1024}
                         shadow-mapSize-height={1024}
                    />

                    {/* Background */}
                    <BackgroundSphere texturePath="/solar-system.png" />

                    {/* Stars */}
                    <Stars radius={200} depth={80} count={5000} factor={5} />

                    {/* Solar System Scene */}
                    <SolarSystemScene />
                    {/* Orbit Controls */}
                    <OrbitControls
                         makeDefault
                         // dollySpeed={0.1}
                         maxDistance={1500}
                         minDistance={50}
                         target={[2, -2, 0]}
                    />
                    <Environment preset="night" />
               </Canvas>
          </div>
     );
};

const BackgroundSphere = ({ texturePath }: { texturePath: string }) => {
     const texture = new THREE.TextureLoader().load(texturePath);

     return (
          <mesh>
               <sphereGeometry args={[500, 120, 40]} />
               <meshBasicMaterial map={texture} side={THREE.BackSide} />
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

               {/* <Sun  /> */}
               <mesh ref={sunRef} position={[0, 0, 0]} scale={[1, 1, 1]}>
                    <sphereGeometry args={[20, 20, 20]} />
                    <meshStandardMaterial color={'yellow'} emissive={'white'} emissiveIntensity={3} />
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


// function Shape({ children, color, ...props }: any) {
//      const [hovered, hover] = useState(true)
//      return (
//           <mesh {...props}>
//                {children}
//                {/* In order to get selective bloom we must crank colors out of
//            their 0-1 spectrum. We push them way out of range. What previously was [1, 1, 1] now could
//            for instance be [10, 10, 10]. */}
//                <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
//           </mesh>

//      )
// }