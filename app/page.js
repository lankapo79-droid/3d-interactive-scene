'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';

function Shape({ position, color, speed = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2 * speed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? 1.3 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1, 1]} />
        <MeshDistortMaterial
          color={color}
          distort={hovered ? 0.6 : 0.3}
          speed={2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </Float>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>3D Interactive Scene</h1>
        <p style={{ margin: '4px 0 0', opacity: 0.7 }}>Drag to orbit · Hover shapes</p>
      </div>
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} color="#e39a3c" />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#f4efe6" />

        <Shape position={[-2, 1, 0]} color="#e39a3c" speed={1.2} />
        <Shape position={[2, -1, -1]} color="#14110e" speed={0.8} />
        <Shape position={[0, 0.5, -2]} color="#f4efe6" speed={1.5} />
        <Shape position={[1.5, 1.5, 1]} color="#c47a2c" speed={0.9} />

        <OrbitControls enablePan={false} minDistance={3} maxDistance={10} />
        <Environment preset="sunset" />
      </Canvas>
    </div>
  );
}