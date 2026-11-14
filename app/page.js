'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function Sun() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.15;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.3, 64, 64]} />
      <meshStandardMaterial color="#e39a3c" emissive="#e39a3c" emissiveIntensity={1.8} roughness={0.25} />
    </mesh>
  );
}

function SaturnRings({ distance, size }) {
  return (
    <mesh rotation={[Math.PI / 2.2, 0, 0]} position={[distance, 0, 0]}>
      <ringGeometry args={[size * 1.6, size * 2.4, 64]} />
      <meshBasicMaterial color="#d4a574" side={THREE.DoubleSide} transparent opacity={0.6} />
    </mesh>
  );
}

function Planet({ distance, size, speed, color, name, hasMoon = false, hasRings = false, onSelect }) {
  const groupRef = useRef();
  const planetRef = useRef();
  const moonRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (groupRef.current) groupRef.current.rotation.y = t;
    if (planetRef.current) planetRef.current.rotation.y = t * 1.8;
    if (moonRef.current && hasMoon) moonRef.current.rotation.y = t * 3.5;
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        position={[distance, 0, 0]}
        scale={hovered ? 1.25 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect?.(name); }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} emissive={color} emissiveIntensity={hovered ? 0.35 : 0.04} />
      </mesh>
      {hasRings && <SaturnRings distance={distance} size={size} />}
      {hasMoon && (
        <group ref={moonRef} position={[distance, 0, 0]}>
          <mesh position={[size * 2.5, 0.2, 0]}>
            <sphereGeometry args={[size * 0.22, 16, 16]} />
            <meshStandardMaterial color="#f4efe6" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function OrbitRing({ distance }) {
  const points = [];
  for (let i = 0; i <= 80; i++) {
    const angle = (i / 80) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={geo}>
      <lineBasicMaterial color="#e39a3c" transparent opacity={0.12} />
    </line>
  );
}

const PLANETS = [
  { name: 'Mercury', distance: 3.2, size: 0.22, speed: 2.0, color: '#c47a2c' },
  { name: 'Venus', distance: 5.0, size: 0.38, speed: 1.4, color: '#e39a3c' },
  { name: 'Earth', distance: 7.2, size: 0.42, speed: 1.0, color: '#4a7c59', hasMoon: true },
  { name: 'Mars', distance: 9.5, size: 0.32, speed: 0.7, color: '#c45c2c' },
  { name: 'Jupiter', distance: 13, size: 1.0, speed: 0.4, color: '#d4a574' },
  { name: 'Saturn', distance: 16.5, size: 0.85, speed: 0.28, color: '#e8c9a0', hasRings: true },
  { name: 'Uranus', distance: 20, size: 0.55, speed: 0.18, color: '#7ec8e3' },
  { name: 'Neptune', distance: 23.5, size: 0.52, speed: 0.12, color: '#3d5a80' },
];

export default function Scene() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0908' }}>
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>Solar System</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.7 }}>Click planet for info · Drag to explore</p>
        {selected && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(20,17,14,0.7)', borderRadius: 8, backdropFilter: 'blur(8px)' }}>
            <strong>{selected}</strong>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Click another planet or drag to continue</div>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [0, 12, 22], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#0a0908']} />
        <ambientLight intensity={0.04} />
        <pointLight position={[0, 0, 0]} intensity={3} color="#e39a3c" distance={40} />

        <Stars radius={180} depth={100} count={6000} factor={7} saturation={0} fade speed={0.3} />
        <Sparkles count={80} scale={30} size={1.2} speed={0.25} color="#f4efe6" />

        <Sun />

        {PLANETS.map(p => (
          <OrbitRing key={p.name} distance={p.distance} />
        ))}

        {PLANETS.map(p => (
          <Planet key={p.name} {...p} onSelect={setSelected} />
        ))}

        <OrbitControls enablePan={false} minDistance={8} maxDistance={40} autoRotate autoRotateSpeed={0.25} />
      </Canvas>
    </div>
  );
}