'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export default function AtmosphereShell({
     radius,
     color,
     opacity = 0.08,
     scale = 1.035,
     pulse = 0.03,
}: {
     radius: number;
     color: string;
     opacity?: number;
     scale?: number;
     pulse?: number;
}) {
     const matRef = useRef<THREE.MeshBasicMaterial>(null);

     useFrame(({ clock }) => {
          const m = matRef.current;
          if (!m) return;
          const t = clock.getElapsedTime();
          const breathe = 1 + Math.sin(t * 0.9) * pulse;
          m.opacity = opacity * breathe;
     });

     return (
          <mesh renderOrder={1}>
               <sphereGeometry args={[radius * scale, 48, 48]} />
               <meshBasicMaterial
                    ref={matRef}
                    color={color}
                    transparent
                    opacity={opacity}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    toneMapped={false}
               />
          </mesh>
     );
}
