import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Box, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Interactive 3D/AR challenges for real environmental action
const EcoChallenge3D = ({ challenge, position, onComplete }) => {
  const groupRef = useRef();
  const [isCompleting, setIsCompleting] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(1);
  
  // Rotate and float animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.02 * rotationSpeed;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      
      if (isCompleting) {
        setRotationSpeed(prev => prev + 0.1);
      }
    }
  });
  
  const handleClick = () => {
    setIsCompleting(true);
    setTimeout(() => {
      onComplete && onComplete(challenge);
    }, 1000);
  };
  
  // Challenge type determines appearance
  const getChallengeVisual = () => {
    switch (challenge.type) {
      case 'recycle':
        return { color: '#0ea5e9', icon: '♻️', glow: '#06b6d4' };
      case 'walk':
        return { color: '#10b981', icon: '🚶', glow: '#22c55e' };
      case 'plant':
        return { color: '#22c55e', icon: '🌱', glow: '#16a34a' };
      case 'energy':
        return { color: '#fbbf24', icon: '💡', glow: '#f59e0b' };
      default:
        return { color: '#8b5cf6', icon: '🌍', glow: '#a78bfa' };
    }
  };
  
  const visual = getChallengeVisual();
  
  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'auto'}
    >
      {/* Main challenge cube */}
      <Box args={[0.5, 0.5, 0.5]}>
        <meshStandardMaterial 
          color={visual.color}
          emissive={visual.glow}
          emissiveIntensity={isCompleting ? 1 : 0.3}
          transparent
          opacity={isCompleting ? 0.8 : 0.9}
        />
      </Box>
      
      {/* Orbiting particles */}
      {[0, 1, 2].map((i) => (
        <Sphere 
          key={i}
          args={[0.05, 16, 16]} 
          position={[
            Math.cos((i / 3) * Math.PI * 2) * 0.5,
            Math.sin((i / 3) * Math.PI * 2) * 0.5,
            0
          ]}
        >
          <meshBasicMaterial color={visual.glow} />
        </Sphere>
      ))}
      
      {/* Challenge info */}
      <Billboard position={[0, 0.8, 0]}>
        <Text
          fontSize={0.3}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
        >
          {visual.icon}
        </Text>
      </Billboard>
      
      <Billboard position={[0, 1.2, 0]}>
        <Text
          fontSize={0.12}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {challenge.title}
        </Text>
      </Billboard>
      
      {/* Points reward */}
      <Billboard position={[0, -0.5, 0]}>
        <Text
          fontSize={0.15}
          color={visual.glow}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          +{challenge.points} pts
        </Text>
      </Billboard>
      
      {/* Completion animation */}
      {isCompleting && (
        <mesh>
          <sphereGeometry args={[0.8, 32, 32]} />
          <meshBasicMaterial 
            color={visual.glow}
            transparent
            opacity={0.3}
            wireframe
          />
        </mesh>
      )}
    </group>
  );
};

// Predefined eco-challenges
export const ecoChallenges = [
  {
    id: 1,
    type: 'recycle',
    title: 'Recycle 5 items',
    description: 'Find and recycle 5 items today',
    points: 50,
    carbonSaved: 2.5
  },
  {
    id: 2,
    type: 'walk',
    title: 'Walk 2km',
    description: 'Walk instead of driving',
    points: 75,
    carbonSaved: 0.8
  },
  {
    id: 3,
    type: 'plant',
    title: 'Plant a tree',
    description: 'Plant a tree in your community',
    points: 100,
    carbonSaved: 21
  },
  {
    id: 4,
    type: 'energy',
    title: 'Save energy',
    description: 'Turn off lights for 1 hour',
    points: 30,
    carbonSaved: 0.5
  },
  {
    id: 5,
    type: 'community',
    title: 'Join cleanup',
    description: 'Participate in community cleanup',
    points: 100,
    carbonSaved: 5
  }
];

export default EcoChallenge3D;

