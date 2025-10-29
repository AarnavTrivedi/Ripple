import { useState } from 'react';
import ARHitTestMarker from './ARHitTestMarker';
import EcoMarker3D from './EcoMarker3D';

const AREnvironment = ({ nearbyItems, type, onMarkerClick }) => {
  const [placedMarkers, setPlacedMarkers] = useState([]);
  
  const handlePlaceMarker = (position) => {
    // Place the nearest unplaced marker at the hit test position
    const unplacedItems = nearbyItems.filter(
      item => !placedMarkers.find(m => m.id === item.id)
    );
    
    if (unplacedItems.length > 0) {
      const itemToPlace = unplacedItems[0];
      setPlacedMarkers(prev => [...prev, {
        ...itemToPlace,
        position: position,
        id: itemToPlace.id || Date.now()
      }]);
    }
  };
  
  return (
    <>
      {/* Lighting for AR */}
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 0]} intensity={1.2} />
      <pointLight position={[2, 2, 2]} color="#10b981" intensity={0.5} />
      
      {/* Hit test marker for placement */}
      <ARHitTestMarker onPlace={handlePlaceMarker} />
      
      {/* Placed markers in AR space */}
      {placedMarkers.map((marker) => (
        <EcoMarker3D
          key={marker.id}
          item={marker}
          position={marker.position}
          type={type}
          onClick={() => onMarkerClick && onMarkerClick(marker)}
        />
      ))}
      
      {/* AR-specific ground shadows */}
      {placedMarkers.map((marker) => (
        <mesh 
          key={`shadow-${marker.id}`}
          position={[marker.position[0], marker.position[1] - 0.3, marker.position[2]]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <circleGeometry args={[0.25, 32]} />
          <meshBasicMaterial 
            color="#000000"
            transparent
            opacity={0.3}
          />
        </mesh>
      ))}
    </>
  );
};

export default AREnvironment;

