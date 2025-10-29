import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Cylinder, Sphere } from '@react-three/drei';

// Visualize carbon saved as growing trees
const CarbonTreeVisualization = ({ carbonSavedKg, position = [0, 0, 0] }) => {
  const groupRef = useRef();
  
  // Calculate number of trees (1 tree = ~21kg CO2 per year)
  const treesEquivalent = Math.floor(carbonSavedKg / 21);
  const growthProgress = (carbonSavedKg % 21) / 21; // 0 to 1
  
  // Gentle swaying animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.05;
    }
  });
  
  // Generate tree positions in a cluster
  const treePositions = useMemo(() => {
    const positions = [];
    const maxTrees = Math.min(treesEquivalent, 10); // Show max 10 trees
    const radius = 1.5;
    
    for (let i = 0; i < maxTrees; i++) {
      const angle = (i / maxTrees) * Math.PI * 2;
      positions.push({
        x: Math.cos(angle) * radius,
        z: Math.sin(angle) * radius,
        scale: 0.8 + Math.random() * 0.4
      });
    }
    return positions;
  }, [treesEquivalent]);
  
  return (
    <group position={position}>
      {/* Complete trees */}
      {treePositions.map((pos, i) => (
        <group key={i} ref={i === 0 ? groupRef : null} position={[pos.x, 0, pos.z]}>
          <Tree scale={pos.scale} />
        </group>
      ))}
      
      {/* Growing tree (progress) */}
      {growthProgress > 0 && (
        <group position={[0, 0, 0]}>
          <Tree scale={0.5 + (growthProgress * 0.5)} isGrowing />
        </group>
      )}
      
      {/* Impact stats */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        {carbonSavedKg.toFixed(1)} kg CO₂ saved
      </Text>
      
      <Text
        position={[0, 2.5, 0]}
        fontSize={0.2}
        color="#22c55e"
        anchorX="center"
        anchorY="middle"
      >
        = {treesEquivalent} tree{treesEquivalent !== 1 ? 's' : ''} planted
      </Text>
      
      {growthProgress > 0 && (
        <Text
          position={[0, 2, 0]}
          fontSize={0.15}
          color="#a0a0a0"
          anchorX="center"
          anchorY="middle"
        >
          {(growthProgress * 100).toFixed(0)}% to next tree
        </Text>
      )}
    </group>
  );
};

// Individual tree component
const Tree = ({ scale = 1, isGrowing = false }) => {
  const foliageRef = useRef();
  
  useFrame((state) => {
    if (foliageRef.current && isGrowing) {
      // Pulsing effect for growing tree
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.1 + 1;
      foliageRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  return (
    <group scale={scale}>
      {/* Trunk */}
      <Cylinder args={[0.1, 0.15, 1, 8]} position={[0, 0.5, 0]}>
        <meshStandardMaterial color="#8B4513" />
      </Cylinder>
      
      {/* Foliage (3 layers) */}
      <group ref={foliageRef} position={[0, 1.2, 0]}>
        <Sphere args={[0.4, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial 
            color={isGrowing ? "#86efac" : "#22c55e"}
            emissive={isGrowing ? "#22c55e" : "#000"}
            emissiveIntensity={isGrowing ? 0.3 : 0}
          />
        </Sphere>
        <Sphere args={[0.35, 16, 16]} position={[0, 0.3, 0]}>
          <meshStandardMaterial color={isGrowing ? "#86efac" : "#22c55e"} />
        </Sphere>
        <Sphere args={[0.25, 16, 16]} position={[0, 0.6, 0]}>
          <meshStandardMaterial color={isGrowing ? "#86efac" : "#16a34a"} />
        </Sphere>
      </group>
      
      {/* Ground indicator */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.3} />
      </mesh>
    </group>
  );
};

export default CarbonTreeVisualization;

