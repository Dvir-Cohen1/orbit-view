'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export default function AsteroidBelt({
     inner,
     outer,
     count = 2200,
     ySpread = 0.6,
}: {
     inner: number;
     outer: number;
     count?: number;
     ySpread?: number;
}) {
     const ref = useRef<THREE.InstancedMesh>(null);
     const dummy = useMemo(() => new THREE.Object3D(), []);

     useEffect(() => {
          const m = ref.current;
          if (!m) return;

          for (let i = 0; i < count; i++) {
               const a = Math.random() * Math.PI * 2;
               const r = THREE.MathUtils.lerp(inner, outer, Math.random());
               const y = (Math.random() - 0.5) * ySpread;

               dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
               dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

               const s = 0.08 + Math.random() * 0.22;
               dummy.scale.setScalar(s);

               dummy.updateMatrix();
               m.setMatrixAt(i, dummy.matrix);
          }

          m.instanceMatrix.needsUpdate = true;
     }, [count, inner, outer, ySpread, dummy]);

     useFrame((_, delta) => {
          const m = ref.current;
          if (!m) return;
          m.rotation.y += delta * 0.015;
     });

     return (
          <instancedMesh ref={ref} args={[undefined as any, undefined as any, count]} renderOrder={-3}>
               <dodecahedronGeometry args={[1, 0]} />
               <meshStandardMaterial color="#b9c1cc" roughness={1} metalness={0} />
          </instancedMesh>
     );
}
