'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
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

function AsteroidBelt({ innerRadius = 10.8, outerRadius = 12.2, count = 350 }) {
  const groupRef = useRef();
  const asteroids = useMemo(() => {
    return Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
      const size = 0.03 + Math.random() * 0.08;
      const y = (Math.random() - 0.5) * 0.4;
      return { angle, radius, size, y, color: Math.random() > 0.5 ? '#8a7a6a' : '#a09080' };
    });
  }, [count, innerRadius, outerRadius]);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {asteroids.map((a, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(a.angle) * a.radius,
            a.y,
            Math.sin(a.angle) * a.radius
          ]}
          rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}
        >
          <icosahedronGeometry args={[a.size, 0]} />
          <meshStandardMaterial color={a.color} roughness={0.8} metalness={0.1} />
        </mesh>
      ))}
    </group>
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

  const isEarth = name === 'Earth';
  const displayColor = isEarth ? '#4da6ff' : color;
  const emissiveIntensity = isEarth ? (hovered ? 0.55 : 0.2) : (hovered ? 0.4 : 0.08);

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        position={[distance, 0, 0]}
        scale={hovered ? 1.3 : (isEarth ? 1.15 : 1)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect?.(name); }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial 
          color={displayColor} 
          roughness={isEarth ? 0.35 : 0.5} 
          metalness={0.1} 
          emissive={displayColor} 
          emissiveIntensity={emissiveIntensity} 
        />
      </mesh>
      {hasRings && <SaturnRings distance={distance} size={size} />}
      {hasMoon && (
        <group ref={moonRef} position={[distance, 0, 0]}>
          <mesh position={[size * 2.8, 0.15, 0]}>
            <sphereGeometry args={[size * 0.25, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
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
      <lineBasicMaterial color="#e39a3c" transparent opacity={0.18} />
    </line>
  );
}

const PLANETS = [
  { name: 'Mercury', distance: 3.2, size: 0.22, speed: 2.0, color: '#c47a2c' },
  { name: 'Venus', distance: 5.0, size: 0.38, speed: 1.4, color: '#e39a3c' },
  { name: 'Earth', distance: 7.2, size: 0.48, speed: 1.0, color: '#4da6ff', hasMoon: true },
  { name: 'Mars', distance: 9.5, size: 0.32, speed: 0.7, color: '#c45c2c' },
  { name: 'Jupiter', distance: 13, size: 1.0, speed: 0.4, color: '#d4a574' },
  { name: 'Saturn', distance: 16.5, size: 0.85, speed: 0.28, color: '#e8c9a0', hasRings: true },
  { name: 'Uranus', distance: 20, size: 0.55, speed: 0.18, color: '#7ec8e3' },
  { name: 'Neptune', distance: 23.5, size: 0.52, speed: 0.12, color: '#3d5a80' },
];

export default function Scene() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#1a2332' }}>
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>Solar System</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.85 }}>Langit lebih cerah · Bumi nampak clear</p>
        {selected && (
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(20,17,14,0.75)', borderRadius: 8, backdropFilter: 'blur(8px)' }}>
            <strong>{selected === 'Earth' ? 'Bumi (Earth)' : selected}</strong>
            <div style={{ fontSize: 13, opacity: 0.8, marginTop: 4 }}>Click another planet or drag to continue</div>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [0, 12, 22], fov: 42 }} dpr={[1, 2]}>
        <color attach="background" args={['#1a2332']} />
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={3.5} color="#e39a3c" distance={45} />

        <Stars radius={180} depth={100} count={4000} factor={5} saturation={0} fade speed={0.2} />
        <Sparkles count={60} scale={30} size={1} speed={0.2} color="#f4efe6" />

        <Sun />

        {PLANETS.map(p => (
          <OrbitRing key={p.name} distance={p.distance} />
        ))}

        <AsteroidBelt />

        {PLANETS.map(p => (
          <Planet key={p.name} {...p} onSelect={setSelected} />
        ))}

        <OrbitControls enablePan={false} minDistance={8} maxDistance={40} autoRotate autoRotateSpeed={0.25} />
      </Canvas>
    </div>
  );
}