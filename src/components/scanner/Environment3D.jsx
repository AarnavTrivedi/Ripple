import { useMemo } from 'react';
import { OrbitControls, Environment, Sky, Grid } from '@react-three/drei';
import EcoMarker3D from './EcoMarker3D';

const Environment3D = ({ nearbyItems, type, userLocation, onMarkerClick }) => {
  // Transform nearby items to 3D positions
  const markers = useMemo(() => {
    if (!nearbyItems || !userLocation) return [];
    
    return nearbyItems.map((item, index) => {
      // Convert distance and bearing to 3D position
      // Spread items in a circle around user
      const angle = (index / nearbyItems.length) * Math.PI * 2;
      const distance = Math.min(item.distance * 0.5, 3); // Scale down distance for visibility
      
      const x = Math.sin(angle) * distance;
      const z = Math.cos(angle) * distance;
      const y = 1 + (Math.random() * 0.5); // Random height variation
      
      return {
        ...item,
        position: [x, y, z]
      };
    });
  }, [nearbyItems, userLocation]);
  
  return (
    <>
      {/* Environment lighting */}
      <Environment preset="sunset" />
      <Sky sunPosition={[100, 20, 100]} />
      
      {/* Ambient atmosphere */}
      <fog attach="fog" args={['#1a2f26', 5, 20]} />
      
      {/* Ground grid */}
      <Grid
        position={[0, 0, 0]}
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#10b981"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#0ea5e9"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid={true}
      />
      
      {/* Semi-transparent ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial 
          color="#0f5132" 
          transparent 
          opacity={0.3}
          roughness={1}
        />
      </mesh>
      
      {/* 3D Markers */}
      {markers.map((item, index) => (
        <EcoMarker3D
          key={index}
          item={item}
          position={item.position}
          type={type}
          onClick={() => onMarkerClick && onMarkerClick(item)}
        />
      ))}
      
      {/* User position indicator */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.2, 32]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          emissive="#0ea5e9"
          emissiveIntensity={0.5}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* User direction indicator */}
      <mesh position={[0, 0.3, -0.4]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 16]} />
        <meshStandardMaterial 
          color="#0ea5e9" 
          emissive="#0ea5e9"
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* Ambient particles */}
      <AmbientParticles type={type} />
      
      {/* Camera controls for 3D mode */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={15}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        target={[0, 1, 0]}
      />
    </>
  );
};

// Floating ambient particles
const AmbientParticles = ({ type }) => {
  const particleCount = 100;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);
  
  const color = type === 'green' ? '#10b981' : '#f59e0b';
  
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={color}
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

export default Environment3D;

