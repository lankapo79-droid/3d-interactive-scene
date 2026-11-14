'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Float, MeshDistortMaterial, Environment, Stars, Sparkles } from '@react-three/drei';
import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';

function FloatingShape({ position, color, type = 'ico', speed = 1, onClick }) {
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
        onClick={(e) => { e.stopPropagation(); onClick?.(position, color); }}
      >
        {geometry}
        <MeshDistortMaterial
          color={color}
          distort={hovered ? 0.8 : 0.4}
          speed={4}
          roughness={0.1}
          metalness={0.95}
          emissive={color}
          emissiveIntensity={hovered ? 0.6 : 0.15}
        />
      </mesh>
    </Float>
  );
}

function Explosion({ position, color, onDone }) {
  const groupRef = useRef();
  const particles = useMemo(() => {
    return Array.from({ length: 40 }, () => ({
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8
      ),
      life: 1
    }));
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    let alive = false;
    particles.forEach((p, i) => {
      p.life -= delta * 1.5;
      if (p.life > 0) alive = true;
      const child = groupRef.current.children[i];
      if (child) {
        child.position.addScaledVector(p.velocity, delta);
        child.scale.setScalar(Math.max(0, p.life));
      }
    });
    if (!alive) onDone?.();
  });

  return (
    <group ref={groupRef} position={position}>
      {particles.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

function ParticleField() {
  const count = 1200;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 25;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    return pos;
  }, []);

  const pointsRef = useRef();
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.08;
      pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.025} color="#e39a3c" transparent opacity={0.7} sizeAttenuation />
    </points>
  );
}

function SceneContent() {
  const [explosions, setExplosions] = useState([]);

  const handleClick = (pos, color) => {
    const id = Date.now();
    setExplosions(prev => [...prev, { id, position: pos, color }]);
  };

  return (
    <>
      <color attach="background" args={['#0a0908']} />
      <ambientLight intensity={0.15} />
      <directionalLight position={[10, 6, 5]} intensity={1.8} color="#e39a3c" />
      <pointLight position={[-8, 5, -5]} intensity={1} color="#f4efe6" />
      <pointLight position={[0, -6, 3]} intensity={0.5} color="#c47a2c" />

      <Stars radius={120} depth={60} count={4000} factor={5} saturation={0} fade speed={0.6} />
      <Sparkles count={120} scale={10} size={2.5} speed={0.5} color="#e39a3c" />

      <ParticleField />

      <FloatingShape position={[-2.5, 1.2, 0]} color="#e39a3c" type="ico" speed={1.1} onClick={handleClick} />
      <FloatingShape position={[2.8, -0.8, -1]} color="#f4efe6" type="torus" speed={0.7} onClick={handleClick} />
      <FloatingShape position={[0.3, 0.5, -2.5]} color="#c47a2c" type="sphere" speed={1.4} onClick={handleClick} />
      <FloatingShape position={[1.8, 1.8, 1.2]} color="#e39a3c" type="ico" speed={0.9} onClick={handleClick} />
      <FloatingShape position={[-1.5, -1.5, 0.5]} color="#a06020" type="torus" speed={1.2} onClick={handleClick} />
      <FloatingShape position={[0, -2, 1]} color="#e39a3c" type="sphere" speed={1.6} onClick={handleClick} />

      {explosions.map(exp => (
        <Explosion
          key={exp.id}
          position={exp.position}
          color={exp.color}
          onDone={() => setExplosions(prev => prev.filter(e => e.id !== exp.id))}
        />
      ))}

      <OrbitControls enablePan={false} minDistance={4} maxDistance={16} autoRotate autoRotateSpeed={0.5} />
      <Environment preset="night" />
    </>
  );
}

export default function Scene() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0908' }}>
      <div style={{ position: 'absolute', top: 24, left: 24, color: '#f4efe6', zIndex: 10, fontFamily: 'system-ui' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 600 }}>Gempak 3D Scene</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.7 }}>Click shapes to explode · Drag to orbit</p>
      </div>
      <Canvas camera={{ position: [0, 0, 9], fov: 42 }} dpr={[1, 2]}>
        <SceneContent />
      </Canvas>
    </div>
  );
}