import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXRHitTest } from '@react-three/xr';
import { Text, Ring } from '@react-three/drei';
import * as THREE from 'three';

const ARHitTestMarker = ({ onPlace }) => {
  const markerRef = useRef();
  const [hitPosition, setHitPosition] = useState([0, 0, 0]);
  const [isHitting, setIsHitting] = useState(false);
  
  // Continuous hit testing against detected surfaces
  useXRHitTest((results, getWorldMatrix) => {
    if (results && results.length > 0) {
      const hit = results[0];
      const hitMatrix = getWorldMatrix(hit);
      
      const position = new THREE.Vector3();
      position.setFromMatrixPosition(hitMatrix);
      
      setHitPosition([position.x, position.y, position.z]);
      setIsHitting(true);
    } else {
      setIsHitting(false);
    }
  }, 'viewer', 'plane');
  
  // Animate marker
  useFrame((state) => {
    if (markerRef.current && isHitting) {
      markerRef.current.rotation.z += 0.02;
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.1 + 1;
      markerRef.current.scale.set(pulse, pulse, pulse);
    }
  });
  
  if (!isHitting) return null;
  
  return (
    <group position={hitPosition}>
      {/* Animated ring marker */}
      <group ref={markerRef}>
        <Ring 
          args={[0.15, 0.2, 32]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial 
            color="#10b981" 
            transparent 
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </Ring>
        
        {/* Inner ring */}
        <Ring 
          args={[0.08, 0.12, 32]} 
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <meshBasicMaterial 
            color="#10b981" 
            transparent 
            opacity={0.6}
            side={THREE.DoubleSide}
          />
        </Ring>
      </group>
      
      {/* Center dot */}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981"
          emissiveIntensity={1}
        />
      </mesh>
      
      {/* Instruction text */}
      <Text
        position={[0, 0.3, 0]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        Tap to scan
      </Text>
      
      {/* Vertical guide line */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.4}
        />
      </mesh>
    </group>
  );
};

export default ARHitTestMarker;

