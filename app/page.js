'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState } from 'react';
import * as THREE from 'three';

function Sun() {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[1.2, 64, 64]} />
      <meshStandardMaterial color="#e39a3c" emissive="#e39a3c" emissiveIntensity={1.5} roughness={0.3} />
    </mesh>
  );
}

function Planet({ distance, size, speed, color, name, hasMoon = false }) {
  const groupRef = useRef();
  const planetRef = useRef();
  const moonRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    if (groupRef.current) {
      groupRef.current.rotation.y = t;
    }
    if (planetRef.current) {
      planetRef.current.rotation.y = t * 2;
    }
    if (moonRef.current && hasMoon) {
      moonRef.current.rotation.y = t * 4;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={planetRef}
        position={[distance, 0, 0]}
        scale={hovered ? 1.3 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} emissive={color} emissiveIntensity={hovered ? 0.3 : 0.05} />
      </mesh>
      {hasMoon && (
        <group ref={moonRef} position={[distance, 0, 0]}>
          <mesh position={[size * 2.2, 0, 0]}>
            <sphereGeometry args={[size * 0.25, 16, 16]} />
            <meshStandardMaterial color="#f4efe6" />
          </mesh>
        </group>
      )}
    </group>
  );
}

function OrbitRing({ distance }) {
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const angle = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(angle) * distance, 0, Math.sin(angle) * distance));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color="#e39a3c" transparent opacity={0.15} />
    </line>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0908' }}>
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>Solar System</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.7 }}>Drag to orbit · Hover planets</p>
      </div>

      <Canvas camera={{ position: [0, 8, 16], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#0a0908']} />
        <ambientLight intensity={0.05} />
        <pointLight position={[0, 0, 0]} intensity={2.5} color="#e39a3c" distance={30} />

        <Stars radius={150} depth={80} count={5000} factor={6} saturation={0} fade speed={0.4} />
        <Sparkles count={60} scale={20} size={1.5} speed={0.3} color="#f4efe6" />

        <Sun />

        <OrbitRing distance={3} />
        <OrbitRing distance={5} />
        <OrbitRing distance={7.5} />
        <OrbitRing distance={10} />
        <OrbitRing distance={13} />

        <Planet distance={3} size={0.25} speed={1.8} color="#c47a2c" name="Mercury" />
        <Planet distance={5} size={0.4} speed={1.2} color="#e39a3c" name="Venus" />
        <Planet distance={7.5} size={0.45} speed={0.9} color="#4a7c59" name="Earth" hasMoon />
        <Planet distance={10} size={0.35} speed={0.6} color="#c45c2c" name="Mars" />
        <Planet distance={13} size={0.9} speed={0.35} color="#d4a574" name="Jupiter" />

        <OrbitControls enablePan={false} minDistance={6} maxDistance={30} autoRotate autoRotateSpeed={0.3} />
      </Canvas>
    </div>
  );
}