// SolarSystem.tsx
'use client';

import React, { useState, useRef, useMemo, useCallback, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Environment,
  Loader,
  useCursor,
  useTexture as useTextureDrei,
} from '@react-three/drei';
import * as THREE from 'three';
import PlanetMenu from './PlanetMenu';
import { PLANETS } from '@/constants/solarSystem.constants';
import { PlanetProps } from '../../../globals';
import { EffectComposer, Bloom, ToneMapping, Vignette } from '@react-three/postprocessing';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const MAX_CAMERA_DISTANCE = 20000;

/**
 * ---------- Immersive realism knobs ----------
 */
const TIME_SCALE = 0.18;
const ORBIT_POWER = 0.58;
const ORBIT_MULT = 26;

const SUN_VISUAL_RADIUS = 32;
const SUN_REAL_RADIUS_KM = 696_340;

const RADIUS_POWER = 0.42;
const PLANET_MIN_RADIUS = 0.35;

/**
 * Map real-ish distances (million km) into explorable world units
 */
const mapOrbitFromAvgDistance = (avgMillionKm?: number, fallback = 100) => {
  const d = avgMillionKm ?? fallback;
  return ORBIT_MULT * Math.pow(d, ORBIT_POWER);
};

/**
 * Map real radius (km) into usable planet radii while keeping proportions
 */
const mapRadiusFromReal = (realRadiusKm?: number, fallback = 1) => {
  if (!realRadiusKm) return fallback;
  const ratio = realRadiusKm / SUN_REAL_RADIUS_KM;
  return Math.max(PLANET_MIN_RADIUS, SUN_VISUAL_RADIUS * Math.pow(ratio, RADIUS_POWER));
};

const useTexture = (path?: string) =>
  useMemo(() => (path ? new THREE.TextureLoader().load(path) : null), [path]);

type FocusTarget = { type: 'sun' } | { type: 'planet'; name: string } | null;
type PlanetPositionStore = Record<string, THREE.Vector3>;

const SolarSystem = () => {
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [focusedTarget, setFocusedTarget] = useState<FocusTarget>({ type: 'sun' });
  const [isPlanetMenuOpen, setIsPlanetMenuOpen] = useState(false);
  const [isCameraRotationEnabled, setIsCameraRotationEnabled] = useState(true);

  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const planetPositionsRef = useRef<PlanetPositionStore>({});

  const planetsByName = useMemo(() => {
    const m = new Map<string, (typeof PLANETS)[number]>();
    for (const p of PLANETS) m.set(p.name, p);
    return m;
  }, []);

  const updatePlanetPosition = useCallback((name: string, pos: THREE.Vector3) => {
    planetPositionsRef.current[name] = pos.clone();
  }, []);

  const getPlanetPosition = useCallback((name: string) => {
    return planetPositionsRef.current[name]?.clone() ?? null;
  }, []);

  const toggleCameraRotation = () => setIsCameraRotationEnabled((prev) => !prev);

  // ✅ compute farthest mapped orbit so Oort shells always stay outside
  const outermostOrbit = useMemo(() => {
    let max = 0;
    for (const p of PLANETS) {
      const orbit = mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance);
      if (orbit > max) max = orbit;
    }
    return max;
  }, []);

  return (
    <div className="relative">
      <Canvas
        camera={{ position: [0, 10, 200], near: 0.1, far: 40000 }}
        gl={{ logarithmicDepthBuffer: true }}
        onCreated={({ gl }) => {
          gl.toneMappingExposure = 0.8; // global dim
        }}
        style={{ height: '100vh' }}
        shadows
      >
        {/* Infinite panorama background + slow drift */}
        <Suspense fallback={null}>
          <PanoramaBackground texturePath="/solar-system.png" driftSpeed={5.0025} />
        </Suspense>

        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={1} intensity={1.4} />
          <ToneMapping />

          {/* ✅ very subtle camera vignette */}
          <Vignette eskil={false} offset={0.12} darkness={0.45} />
        </EffectComposer>

        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} intensity={2} castShadow />
        <directionalLight position={[0, 20, 20]} intensity={1} castShadow />

        {/* ✅ "true Oort Cloud shell" */}
        <OortCloud outermostOrbit={outermostOrbit} />

        {/* ✅ faint galactic dust plane (subtle foreground layer) */}
        <GalacticDustPlane outermostOrbit={outermostOrbit} />

        <SolarSystemScene
          setSelectedPlanet={setSelectedPlanet}
          setFocusedTarget={setFocusedTarget}
          isCameraRotationEnabled={isCameraRotationEnabled}
          selectedPlanet={selectedPlanet}
          focusedTarget={focusedTarget}
          onPlanetPosition={updatePlanetPosition}
        />

        <CameraController
          controlsRef={controlsRef}
          focusedTarget={focusedTarget}
          getPlanetPosition={getPlanetPosition}
          getPlanetRadius={(name) => {
            const p = planetsByName.get(name);
            if (!p) return 1;
            return mapRadiusFromReal((p as any).realRadius, p.radius);
          }}
        />

        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.08}
          maxDistance={MAX_CAMERA_DISTANCE}
          minDistance={10}
          enableZoom
          zoomSpeed={1.4}
        />

        <Environment preset="night" />
      </Canvas>

      <PlanetMenu
        selectedPlanet={selectedPlanet}
        focusedTarget={focusedTarget}
        isPlanetMenuOpen={isPlanetMenuOpen}
        setIsPlanetMenuOpen={setIsPlanetMenuOpen}
        setSelectedPlanet={setSelectedPlanet}
        setFocusedTarget={setFocusedTarget}
        toggleCameraRotation={toggleCameraRotation}
        isCameraRotationEnabled={isCameraRotationEnabled}
      />

      <Loader />
    </div>
  );
};

/**
 * ✅ Panorama background (modern three.js) + "Milky Way drift"
 * driftSpeed: radians per second (very small!)
 */
const PanoramaBackground = ({
  texturePath,
  driftSpeed = 0.0,
}: {
  texturePath: string;
  driftSpeed?: number;
}) => {
  const texture = useTextureDrei(texturePath);
  const { scene } = useThree();

  // apply once
  useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;

    // enable rotation support
    texture.center.set(0.5, 0.5);

    texture.needsUpdate = true;
    scene.background = texture;

    // dim ONLY background
    scene.backgroundIntensity = 0.38;

    return () => {
      if (scene.background === texture) {
        scene.background = null;
        scene.backgroundIntensity = 1;
      }
    };
  }, [scene, texture]);

  // drift over time
  useFrame((_, delta) => {
    if (driftSpeed <= 0) return;
    texture.rotation += driftSpeed * delta;
  });

  return null;
};

/**
 * ✅ "True Oort Cloud shell": 2 thin shells far outside farthest orbit.
 */
const OortCloud = ({ outermostOrbit }: { outermostOrbit: number }) => {
  const innerRadius = outermostOrbit * 2.1;
  const innerDepth = innerRadius * 0.08;

  const outerRadius = outermostOrbit * 2.9;
  const outerDepth = outerRadius * 0.06;

  return (
    <>
      <Stars
        radius={innerRadius}
        depth={innerDepth}
        count={6500}
        factor={3.2}
        saturation={0.2}
        fade
        speed={0.15}
      />
      <Stars
        radius={outerRadius}
        depth={outerDepth}
        count={4200}
        factor={4.0}
        saturation={0.15}
        fade
        speed={0.1}
      />
    </>
  );
};

/**
 * ✅ Faint galactic dust plane (procedural, no new assets)
 * - A big semi-transparent plane, slowly drifting/rotating
 * - Additive blending to feel like faint nebula/dust
 */
const GalacticDustPlane = ({ outermostOrbit }: { outermostOrbit: number }) => {
  const tex = useMemo(() => createDustTexture(1024), []);
  const planeRef = useRef<THREE.Mesh>(null);

  // place it beyond the planet system but "in front" of the pano
  const size = outermostOrbit * 6.5;

  useFrame((_, delta) => {
    const m = planeRef.current;
    if (!m) return;
    m.rotation.z += delta * 0.01;
  });

  return (
    <mesh
      ref={planeRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -outermostOrbit * 0.35, 0]}
      renderOrder={-10}
    >
      <planeGeometry args={[size, size, 1, 1]} />
      <meshBasicMaterial
        map={tex}
        transparent
        opacity={0.12}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

/**
 * Procedural dust texture (soft cloudy alpha)
 */
function createDustTexture(size = 512) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    const fallback = new THREE.Texture();
    fallback.needsUpdate = true;
    return fallback;
  }

  // base black
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, size, size);

  // layered soft blobs
  for (let i = 0; i < 2200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;

    const r = 6 + Math.random() * 60;
    const a = Math.random() * 0.045; // keep subtle

    // bias density toward center for "galactic band" feel
    const centerBias = 1 - Math.min(1, Math.abs(y - size / 2) / (size / 2));
    const alpha = a * (0.35 + centerBias * 0.9);

    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(255,255,255,${alpha})`);
    g.addColorStop(1, `rgba(255,255,255,0)`);

    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Follow controller that preserves user zoom.
 */
const CameraController = ({
  controlsRef,
  focusedTarget,
  getPlanetPosition,
  getPlanetRadius,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  focusedTarget: FocusTarget;
  getPlanetPosition: (name: string) => THREE.Vector3 | null;
  getPlanetRadius: (name: string) => number;
}) => {
  const { camera } = useThree();

  const tmpTarget = useMemo(() => new THREE.Vector3(), []);
  const tmpOffset = useMemo(() => new THREE.Vector3(), []);
  const tmpDesiredPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!focusedTarget) return;

    if (focusedTarget.type === 'sun') {
      tmpTarget.set(0, 0, 0);
    } else {
      const live = getPlanetPosition(focusedTarget.name);
      if (!live) return;
      tmpTarget.copy(live);
    }

    const controls = controlsRef.current;

    if (controls) tmpOffset.copy(controls.object.position).sub(controls.target);
    else tmpOffset.copy(camera.position).sub(tmpTarget);

    let distance = tmpOffset.length();

    const minDistance =
      focusedTarget.type === 'sun' ? 140 : Math.max(10, getPlanetRadius(focusedTarget.name) * 6.0);

    distance = THREE.MathUtils.clamp(distance, minDistance, MAX_CAMERA_DISTANCE);

    tmpOffset.normalize().multiplyScalar(distance);
    tmpDesiredPos.copy(tmpTarget).add(tmpOffset);

    camera.position.lerp(tmpDesiredPos, 0.18);

    if (controls) {
      controls.target.lerp(tmpTarget, 0.22);
      controls.update();
    } else {
      camera.lookAt(tmpTarget);
    }
  });

  return null;
};

const SolarSystemScene = ({
  setSelectedPlanet,
  setFocusedTarget,
  isCameraRotationEnabled,
  selectedPlanet,
  focusedTarget,
  onPlanetPosition,
}: {
  setSelectedPlanet: (planetName: string | null) => void;
  setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
  isCameraRotationEnabled: boolean;
  selectedPlanet: string | null;
  focusedTarget: FocusTarget;
  onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
}) => {
  const sunRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (sunRef.current) sunRef.current.rotation.y += 0.005;
  });

  return (
    <>
      <mesh
        ref={sunRef}
        position={[0, 0, 0]}
        onClick={() => {
          setFocusedTarget({ type: 'sun' });
          setSelectedPlanet(null);
        }}
      >
        <sphereGeometry args={[SUN_VISUAL_RADIUS, 32, 32]} />
        <meshStandardMaterial emissive="white" emissiveIntensity={8} color="#fff1cc" />
      </mesh>

      {PLANETS.map((p) => {
        const orbit = mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance);
        return (
          <mesh key={`${p.name}-orbit`} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[orbit - 0.2, orbit + 0.2, 128]} />
            <meshBasicMaterial color="#333" side={THREE.DoubleSide} transparent opacity={0.35} />
          </mesh>
        );
      })}

      {PLANETS.map((p) => (
        <Planet
          key={p.name}
          {...(p as PlanetProps)}
          distance={mapOrbitFromAvgDistance((p as any).avgDistanceFromSun, p.distance)}
          radius={mapRadiusFromReal((p as any).realRadius, p.radius)}
          setSelectedPlanet={setSelectedPlanet}
          setFocusedTarget={setFocusedTarget}
          isCameraRotationEnabled={isCameraRotationEnabled}
          selectedPlanet={selectedPlanet}
          focusedTarget={focusedTarget}
          onPlanetPosition={onPlanetPosition}
        />
      ))}
    </>
  );
};

const calculateOrbitPosition = (time: number, distance: number) => ({
  x: Math.cos(time) * distance,
  z: Math.sin(time) * distance,
});

const Planet = ({
  name,
  radius,
  distance,
  speed,
  color,
  texture,
  angle,
  setSelectedPlanet,
  setFocusedTarget,
  isCameraRotationEnabled,
  selectedPlanet,
  focusedTarget,
  onPlanetPosition,
}: PlanetProps & {
  setSelectedPlanet: (planetName: string | null) => void;
  setFocusedTarget: React.Dispatch<React.SetStateAction<FocusTarget>>;
  isCameraRotationEnabled: boolean;
  selectedPlanet: string | null;
  focusedTarget: FocusTarget;
  onPlanetPosition: (name: string, pos: THREE.Vector3) => void;
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const planetTexture = useTexture(texture);
  useCursor(hovered);

  const tmpWorld = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    if (isCameraRotationEnabled) {
      const t = clock.getElapsedTime() * TIME_SCALE * speed;
      const { x, z } = calculateOrbitPosition(t, distance);

      const tilt = THREE.MathUtils.degToRad(angle ?? 0);
      const y = Math.sin(t) * Math.sin(tilt) * (distance * 0.05);

      g.position.set(x, y, z);
    }

    if (meshRef.current) meshRef.current.rotation.y += 0.01;

    g.getWorldPosition(tmpWorld);
    onPlanetPosition(name, tmpWorld);
  });

  const handleClick = () => {
    setSelectedPlanet(name);
    setFocusedTarget({ type: 'planet', name });
  };

  const isSelected = selectedPlanet === name;
  const isFocused = focusedTarget?.type === 'planet' && focusedTarget.name === name;
  const scale = isFocused ? 1.35 : isSelected ? 1.25 : hovered ? 1.12 : 1;

  return (
    <group
      ref={groupRef}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
      scale={scale}
    >
      <mesh ref={meshRef} castShadow receiveShadow>
        <sphereGeometry args={[radius, 64, 64]} />
        <meshStandardMaterial
          map={planetTexture || null}
          color={color || 'white'}
          emissive={isFocused ? 'white' : color || 'white'}
          emissiveIntensity={isFocused ? 0.65 : 0.08}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

export default SolarSystem;
