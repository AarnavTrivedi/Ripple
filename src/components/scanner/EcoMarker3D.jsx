import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sphere, Ring } from '@react-three/drei';
import * as THREE from 'three';

const EcoMarker3D = ({ item, position, type, onClick }) => {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
      groupRef.current.rotation.y += 0.01;
    }
  });
  
  // Color based on type
  const getColor = () => {
    if (type === 'green') {
      return item.points_reward > 60 ? '#10b981' : '#22c55e';
    } else { // hazard
      const level = item.hazard_level || 50;
      if (level > 70) return '#ef4444';
      if (level > 40) return '#f59e0b';
      return '#fbbf24';
    }
  };
  
  const color = getColor();
  const scale = hovered ? 1.2 : 1;
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {/* Main sphere */}
      <Sphere args={[0.2 * scale, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 0.8 : 0.5}
          transparent
          opacity={0.9}
        />
      </Sphere>
      
      {/* Outer glow ring */}
      <Sphere args={[0.25 * scale, 32, 32]}>
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
      
      {/* Pulsing ring at base */}
      <Ring 
        args={[0.15 * scale, 0.2 * scale, 32]} 
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.3, 0]}
      >
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
        />
      </Ring>
      
      {/* Billboard text (always faces camera) */}
      <Billboard position={[0, 0.5, 0]}>
        <Text
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
          maxWidth={2}
        >
          {item.title || item.name}
        </Text>
        
        {/* Distance */}
        <Text
          position={[0, -0.18, 0]}
          fontSize={0.08}
          color="#a0a0a0"
          anchorX="center"
          anchorY="middle"
        >
          {item.distance ? `${item.distance.toFixed(1)} km` : ''}
        </Text>
        
        {/* Points or hazard level */}
        {type === 'green' && item.points_reward && (
          <Text
            position={[0, -0.32, 0]}
            fontSize={0.1}
            color={color}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            +{item.points_reward} pts
          </Text>
        )}
        
        {type === 'hazard' && item.hazard_level && (
          <Text
            position={[0, -0.32, 0]}
            fontSize={0.1}
            color={color}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            Level: {item.hazard_level}
          </Text>
        )}
      </Billboard>
      
      {/* Particle effect */}
      <ParticleRing color={color} scale={scale} />
    </group>
  );
};

// Particle ring effect
const ParticleRing = ({ color, scale = 1 }) => {
  const particlesRef = useRef();
  const particleCount = 16;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.35 * scale;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.015;
    }
  });
  
  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04 * scale}
        color={color}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
};

export default EcoMarker3D;

