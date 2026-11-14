'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState, useMemo } from 'react';
import * as THREE from 'three';

function FloatingShape({ position, color, type = 'ico', speed = 1 }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.4 * speed;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.3;
    }
  });

  const geometry = type === 'ico' ? <icosahedronGeometry args={[0.8, 2]} /> :
                   type === 'torus' ? <torusGeometry args={[0.6, 0.25, 16, 32]} /> :
                   <sphereGeometry args={[0.7, 32, 32]} />;

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh
        ref={meshRef}
        position={position}
        scale={hovered ? 1.4 : 1}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        {geometry}
        <MeshDistortMaterial
          color={color}
          distort={hovered ? 0.7 : 0.35}
          speed={3}
          roughness={0.15}
          metalness={0.9}
          emissive={color}
          emissiveIntensity={hovered ? 0.4 : 0.1}
        />
      </mesh>
    </Float>
  );
}

function ParticleField() {
  const count = 800;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.03} color="#e39a3c" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0908' }}>
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>Gempak 3D Scene</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.7 }}>Drag · Hover shapes · Enjoy the vibe</p>
      </div>

      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={['#0a0908']} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[8, 5, 5]} intensity={1.5} color="#e39a3c" />
        <pointLight position={[-6, 4, -4]} intensity={0.8} color="#f4efe6" />
        <pointLight position={[0, -5, 2]} intensity={0.4} color="#c47a2c" />

        <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />
        <Sparkles count={80} scale={8} size={2} speed={0.4} color="#e39a3c" />

        <ParticleField />

        <FloatingShape position={[-2.5, 1.2, 0]} color="#e39a3c" type="ico" speed={1.1} />
        <FloatingShape position={[2.8, -0.8, -1]} color="#f4efe6" type="torus" speed={0.7} />
        <FloatingShape position={[0.3, 0.5, -2.5]} color="#c47a2c" type="sphere" speed={1.4} />
        <FloatingShape position={[1.8, 1.8, 1.2]} color="#e39a3c" type="ico" speed={0.9} />
        <FloatingShape position={[-1.5, -1.5, 0.5]} color="#a06020" type="torus" speed={1.2} />

        <OrbitControls enablePan={false} minDistance={4} maxDistance={14} autoRotate autoRotateSpeed={0.4} />
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}