# Three.js & AR Implementation Guide for Eco-Trackr
## 🎯 Executive Summary

This guide provides a comprehensive roadmap for integrating Three.js and WebXR AR capabilities into the Eco-Trackr application. Based on deep research using advanced AI tools, this implementation will enable:

- **3D Environmental Data Visualization**: Real-time air quality heatmaps, carbon emissions globes, and green space overlays
- **Augmented Reality Experiences**: Overlay eco-friendly activity prompts and environmental data onto live camera feeds
- **Gamified Environmental Actions**: Interactive 3D elements that encourage sustainable behaviors
- **Immersive Education**: 3D visualizations that make environmental impact tangible and understandable

---

## 📚 Technology Stack

### Core Libraries
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.0",
  "@react-three/drei": "^9.96.0",
  "@react-three/xr": "^6.2.0"
}
```

### What Each Library Does

**Three.js** (`three`)
- Low-level WebGL renderer
- Scene graph, cameras, lights, materials, geometries
- Cross-browser 3D graphics without plugins

**React Three Fiber** (`@react-three/fiber`)
- React renderer for Three.js
- Declarative component-based 3D scenes
- Hooks for animation (useFrame) and state management
- Better performance through React's reconciliation

**Drei** (`@react-three/drei`)
- Helper components and utilities
- Pre-built components: Sky, Cloud, Stars, Text, etc.
- Loaders: useGLTF, useTexture
- Controls: OrbitControls, PointerLockControls
- Performance: Instances, AdaptiveDpr, Preload

**React Three XR** (`@react-three/xr`)
- WebXR integration for VR/AR
- Hit testing for surface detection
- Hand tracking and controllers
- Cross-platform AR support

---

## 🏗️ Architecture Overview

### Integration Strategy

```
Current Stack (2D)          New Stack (3D/AR)
┌─────────────────┐        ┌──────────────────┐
│ Leaflet Map     │◄─────►│ Three.js Scene   │
│ (2D base layer) │        │ (3D visualization)│
└─────────────────┘        └──────────────────┘
        │                           │
        ▼                           ▼
┌─────────────────┐        ┌──────────────────┐
│ Real Geo Data   │◄─────►│ WebXR AR Layer   │
│ (air quality,   │        │ (camera overlay) │
│  green spaces)  │        │                  │
└─────────────────┘        └──────────────────┘
```

### Component Architecture

```
src/
├── pages/
│   ├── Map.jsx (existing)
│   ├── Map3D.jsx (new - 3D visualization mode)
│   └── ARExperience.jsx (new - AR camera mode)
├── components/
│   ├── three/
│   │   ├── AirQuality3D.jsx (3D heatmap)
│   │   ├── CarbonGlobe.jsx (emissions globe)
│   │   ├── EcoActivityMarker.jsx (AR markers)
│   │   └── GreenSpaces3D.jsx (3D parks/trees)
│   ├── ar/
│   │   ├── ARCanvas.jsx (WebXR wrapper)
│   │   ├── HitTestMarker.jsx (surface placement)
│   │   └── AROverlay.jsx (UI overlay)
│   └── ui/ (existing)
├── hooks/
│   ├── useThreeScene.js (3D scene management)
│   ├── useARSession.js (WebXR session)
│   └── useEnvironmentalData.js (data fetching)
└── utils/
    ├── dataToThree.js (convert data to 3D)
    └── coordinateTransform.js (geo to 3D)
```

---

## 🚀 Step-by-Step Implementation

### Phase 1: Setup & Installation

#### 1.1 Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei @react-three/xr
```

#### 1.2 Update package.json

```json
{
  "dependencies": {
    "three": "^0.160.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.96.0",
    "@react-three/xr": "^6.2.0"
  }
}
```

---

### Phase 2: Create 3D Air Quality Heatmap

#### 2.1 Air Quality 3D Component

Create `src/components/three/AirQuality3D.jsx`:

```jsx
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

const AirQuality3D = ({ airQualityData, userLocation }) => {
  const groupRef = useRef();
  
  // Transform air quality data to 3D positions
  const particles = useMemo(() => {
    if (!airQualityData || !userLocation) return [];
    
    return airQualityData.map(point => {
      // Convert lat/lon to 3D coordinates relative to user
      const relativePos = latLonToLocal(
        point.latitude,
        point.longitude,
        userLocation[0],
        userLocation[1]
      );
      
      // Color based on AQI level
      const color = getAQIColor(point.aqi);
      
      // Size based on pollution level
      const scale = Math.max(0.5, point.pm25 / 50);
      
      return {
        position: [relativePos.x, point.pm25 / 20, relativePos.z],
        color: color,
        scale: scale,
        aqi: point.aqi
      };
    });
  }, [airQualityData, userLocation]);
  
  // Animate particles
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.1;
    }
  });
  
  return (
    <group ref={groupRef}>
      <Instances limit={particles.length}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial />
        
        {particles.map((particle, i) => (
          <Instance
            key={i}
            position={particle.position}
            scale={particle.scale}
            color={particle.color}
          />
        ))}
      </Instances>
      
      {/* Ambient particles effect */}
      <AmbientParticles />
    </group>
  );
};

// Helper: Convert lat/lon to local 3D coordinates
const latLonToLocal = (lat, lon, centerLat, centerLon) => {
  const metersPerDegree = 111320;
  const x = (lon - centerLon) * metersPerDegree * Math.cos(centerLat * Math.PI / 180);
  const z = -(lat - centerLat) * metersPerDegree;
  return { x: x / 100, z: z / 100 }; // Scale down for visibility
};

// Helper: Get color based on AQI
const getAQIColor = (aqi) => {
  if (aqi <= 50) return '#10b981'; // Good - Green
  if (aqi <= 100) return '#fbbf24'; // Moderate - Yellow
  if (aqi <= 150) return '#f59e0b'; // Unhealthy for sensitive - Orange
  if (aqi <= 200) return '#ef4444'; // Unhealthy - Red
  if (aqi <= 300) return '#a855f7'; // Very unhealthy - Purple
  return '#7f1d1d'; // Hazardous - Maroon
};

// Ambient floating particles
const AmbientParticles = () => {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 50;
      pos[i * 3 + 1] = Math.random() * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    return pos;
  }, []);
  
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.001;
    }
  });
  
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#10b981"
        transparent
        opacity={0.3}
        sizeAttenuation
      />
    </points>
  );
};

export default AirQuality3D;
```

#### 2.2 3D Map Page

Create `src/pages/Map3D.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stars } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AirQuality3D from '@/components/three/AirQuality3D';
import { useAirQualityData } from '@/hooks/useAirQualityData';

const Map3D = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  
  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (error) => {
        console.error('Location error:', error);
      }
    );
  }, []);
  
  // Fetch air quality data
  const { data: airQualityData } = useAirQualityData(userLocation, 5000);
  
  return (
    <div className="h-screen w-full bg-gradient-to-b from-slate-900 to-emerald-950">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white"
            onClick={() => navigate('/map')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to 2D Map
          </Button>
          
          <div className="text-white text-sm">
            <Eye className="w-4 h-4 inline mr-2" />
            3D Environmental View
          </div>
        </div>
      </div>
      
      {/* Three.js Canvas */}
      <Canvas
        camera={{ position: [0, 20, 30], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} color="#10b981" intensity={0.5} />
        
        {/* Environment */}
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade speed={1} />
        <Environment preset="sunset" />
        
        {/* Air Quality Visualization */}
        {airQualityData && userLocation && (
          <AirQuality3D 
            airQualityData={airQualityData} 
            userLocation={userLocation}
          />
        )}
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial 
            color="#1a2f26" 
            transparent 
            opacity={0.5}
            roughness={1}
          />
        </mesh>
        
        {/* Camera Controls */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={10}
          maxDistance={100}
        />
      </Canvas>
      
      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-2">Air Quality Index</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-400" />
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-orange-500" />
            <span>Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500" />
            <span>Very Unhealthy (151+)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map3D;
```

---

### Phase 3: Augmented Reality Implementation

#### 3.1 AR Canvas Wrapper

Create `src/components/ar/ARCanvas.jsx`:

```jsx
import { createXRStore, XR } from '@react-three/xr';
import { Canvas } from '@react-three/fiber';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

const store = createXRStore();

const ARCanvas = ({ children }) => {
  const [isARSupported, setIsARSupported] = useState(true);
  const [isInAR, setIsInAR] = useState(false);
  
  // Check AR support
  useState(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported);
      });
    } else {
      setIsARSupported(false);
    }
  }, []);
  
  const handleEnterAR = () => {
    store.enterAR().then(() => {
      setIsInAR(true);
    }).catch((error) => {
      console.error('Error entering AR:', error);
      alert('Unable to start AR. Please ensure you are on a compatible device with AR support.');
    });
  };
  
  const handleExitAR = () => {
    store.exitAR().then(() => {
      setIsInAR(false);
    });
  };
  
  return (
    <div className="relative w-full h-screen">
      {/* AR Entry Button */}
      {!isInAR && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
          <Button
            onClick={handleEnterAR}
            disabled={!isARSupported}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg rounded-full shadow-2xl"
          >
            <Camera className="w-6 h-6 mr-2" />
            {isARSupported ? 'Enter AR Mode' : 'AR Not Supported'}
          </Button>
          
          {!isARSupported && (
            <p className="text-white text-sm mt-4 text-center">
              AR requires a compatible device and browser
            </p>
          )}
        </div>
      )}
      
      {/* Exit AR Button */}
      {isInAR && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={handleExitAR}
            className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Three.js Canvas with XR */}
      <Canvas>
        <XR store={store}>
          {/* Lighting for AR */}
          <ambientLight intensity={1} />
          <directionalLight position={[0, 5, 0]} intensity={1} />
          
          {children}
        </XR>
      </Canvas>
    </div>
  );
};

export default ARCanvas;
```

#### 3.2 AR Hit Test & Placement

Create `src/components/ar/HitTestMarker.jsx`:

```jsx
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useXRHitTest } from '@react-three/xr';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const HitTestMarker = ({ onPlaceObject }) => {
  const markerRef = useRef();
  const [hitPosition, setHitPosition] = useState([0, 0, 0]);
  const [isHitting, setIsHitting] = useState(false);
  
  // Continuous hit testing
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
    if (markerRef.current) {
      markerRef.current.rotation.y += 0.02;
      markerRef.current.position.y = hitPosition[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });
  
  if (!isHitting) return null;
  
  return (
    <group ref={markerRef} position={hitPosition}>
      {/* Marker Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial 
          color="#10b981" 
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Center Dot */}
      <mesh position={[0, 0.01, 0]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#10b981" emissive="#10b981" />
      </mesh>
      
      {/* Label */}
      <Text
        position={[0, 0.5, 0]}
        fontSize={0.15}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        Tap to place
      </Text>
    </group>
  );
};

export default HitTestMarker;
```

#### 3.3 AR Eco Activity Marker

Create `src/components/ar/EcoActivityMarker.jsx`:

```jsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Sphere } from '@react-three/drei';

const EcoActivityMarker = ({ activity, position }) => {
  const groupRef = useRef();
  
  // Gentle floating animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
    }
  });
  
  // Color based on activity type
  const getActivityColor = (type) => {
    const colors = {
      'plant_tree': '#22c55e',
      'cleanup_event': '#3b82f6',
      'volunteer': '#fbbf24',
      'recycling': '#10b981'
    };
    return colors[type] || '#10b981';
  };
  
  const color = getActivityColor(activity.action_type);
  
  return (
    <group ref={groupRef} position={position}>
      {/* Glowing sphere */}
      <Sphere args={[0.2, 32, 32]}>
        <meshStandardMaterial 
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      {/* Outer ring effect */}
      <Sphere args={[0.25, 32, 32]}>
        <meshBasicMaterial 
          color={color}
          transparent
          opacity={0.2}
          wireframe
        />
      </Sphere>
      
      {/* Billboard text (always faces camera) */}
      <Billboard position={[0, 0.4, 0]}>
        <Text
          fontSize={0.1}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.01}
          outlineColor="#000000"
        >
          {activity.title}
        </Text>
        
        <Text
          position={[0, -0.15, 0]}
          fontSize={0.06}
          color="#10b981"
          anchorX="center"
          anchorY="middle"
        >
          +{activity.points_reward} pts
        </Text>
      </Billboard>
      
      {/* Particle effect */}
      <ParticleRing color={color} />
    </group>
  );
};

// Particle ring effect
const ParticleRing = ({ color }) => {
  const particlesRef = useRef();
  const particleCount = 20;
  
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    const radius = 0.3;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  
  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01;
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
        size={0.05}
        color={color}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
};

export default EcoActivityMarker;
```

#### 3.4 AR Experience Page

Create `src/pages/ARExperience.jsx`:

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ARCanvas from '@/components/ar/ARCanvas';
import HitTestMarker from '@/components/ar/HitTestMarker';
import EcoActivityMarker from '@/components/ar/EcoActivityMarker';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Info } from 'lucide-react';

const ARExperience = () => {
  const navigate = useNavigate();
  const [placedMarkers, setPlacedMarkers] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      }
    );
  }, []);
  
  // Fetch nearby eco activities
  const { data: greenActions } = useQuery({
    queryKey: ['greenActions'],
    queryFn: async () => {
      const data = localStorage.getItem('ecotrackr_data');
      const storedData = data ? JSON.parse(data) : { actions: [] };
      return storedData.actions || [];
    },
    initialData: [],
  });
  
  const handlePlaceMarker = (position) => {
    // Place a marker at the hit test position
    setPlacedMarkers(prev => [...prev, {
      id: Date.now(),
      position: position,
      activity: greenActions[placedMarkers.length % greenActions.length]
    }]);
  };
  
  return (
    <div className="relative w-full h-screen">
      {/* Header overlay */}
      <div className="absolute top-0 left-0 right-0 z-40 p-4 bg-gradient-to-b from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            className="text-white backdrop-blur-sm"
            onClick={() => navigate('/map')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit AR
          </Button>
          
          <Button
            variant="ghost"
            className="text-white backdrop-blur-sm"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* AR Canvas */}
      <ARCanvas>
        {/* Hit test marker for placement */}
        <HitTestMarker onPlaceObject={handlePlaceMarker} />
        
        {/* Placed eco activity markers */}
        {placedMarkers.map((marker) => (
          <EcoActivityMarker
            key={marker.id}
            activity={marker.activity}
            position={marker.position}
          />
        ))}
      </ARCanvas>
      
      {/* Instructions overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-40 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-2">AR Mode Instructions</h3>
        <ul className="text-xs space-y-1">
          <li>• Point your device at a flat surface</li>
          <li>• Tap on the green marker to place eco activities</li>
          <li>• Walk around to view activities from different angles</li>
          <li>• Tap activities to view details and earn points</li>
        </ul>
      </div>
    </div>
  );
};

export default ARExperience;
```

---

### Phase 4: Carbon Emissions Globe

Create `src/components/three/CarbonGlobe.jsx`:

```jsx
import { useRef, useMemo } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { TextureLoader } from 'three';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const CarbonGlobe = ({ emissionData }) => {
  const globeRef = useRef();
  const barsRef = useRef();
  
  // Load Earth texture
  const earthTexture = useLoader(TextureLoader, 
    'https://unpkg.com/three-globe/example/img/earth-day.jpg'
  );
  
  // Generate emission bars
  const bars = useMemo(() => {
    if (!emissionData) return [];
    
    return emissionData.map(emission => {
      const { latitude, longitude, co2_kg } = emission;
      
      // Convert lat/lon to 3D sphere coordinates
      const phi = (90 - latitude) * (Math.PI / 180);
      const theta = (longitude + 180) * (Math.PI / 180);
      
      const radius = 5;
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const y = radius * Math.cos(phi);
      const z = radius * Math.sin(phi) * Math.sin(theta);
      
      // Height based on emissions
      const height = Math.log(co2_kg + 1) * 0.5;
      
      // Color gradient: green to red
      const color = new THREE.Color().lerpColors(
        new THREE.Color('#10b981'),
        new THREE.Color('#ef4444'),
        Math.min(co2_kg / 1000, 1)
      );
      
      return {
        position: [x, y, z],
        height: height,
        color: color,
        rotation: [phi, theta, 0]
      };
    });
  }, [emissionData]);
  
  // Rotate globe slowly
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });
  
  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={globeRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshStandardMaterial 
          map={earthTexture}
          roughness={0.7}
          metalness={0.1}
        />
      </mesh>
      
      {/* Emission bars */}
      <group ref={barsRef}>
        {bars.map((bar, i) => (
          <mesh
            key={i}
            position={bar.position}
            rotation={bar.rotation}
          >
            <boxGeometry args={[0.1, bar.height, 0.1]} />
            <meshStandardMaterial 
              color={bar.color}
              emissive={bar.color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))}
      </group>
      
      {/* Atmospheric glow */}
      <mesh scale={[1.1, 1.1, 1.1]}>
        <sphereGeometry args={[5, 64, 64]} />
        <meshBasicMaterial
          color="#10b981"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
      
      <OrbitControls enablePan={false} />
    </group>
  );
};

export default CarbonGlobe;
```

---

## 📱 Mobile & Performance Optimization

### Best Practices

#### 1. Use Instanced Rendering for Large Datasets

```jsx
import { Instances, Instance } from '@react-three/drei';

// Instead of rendering 1000 individual meshes:
// ❌ DON'T
{data.map(item => (
  <mesh key={item.id}>
    <sphereGeometry />
    <meshStandardMaterial />
  </mesh>
))}

// ✅ DO
<Instances limit={1000}>
  <sphereGeometry />
  <meshStandardMaterial />
  {data.map(item => (
    <Instance key={item.id} position={item.pos} color={item.color} />
  ))}
</Instances>
```

#### 2. Adaptive Device Pixel Ratio

```jsx
<Canvas dpr={[1, 2]}>
  {/* Scene content */}
</Canvas>
```

#### 3. Performance Monitoring

```jsx
import { PerformanceMonitor } from '@react-three/drei';

<Canvas>
  <PerformanceMonitor
    onIncline={() => setQuality('high')}
    onDecline={() => setQuality('low')}
  >
    {/* Scene content */}
  </PerformanceMonitor>
</Canvas>
```

#### 4. Lazy Loading with Suspense

```jsx
import { Suspense } from 'react';
import { useGLTF } from '@react-three/drei';

const Heavy3DModel = () => {
  const { scene } = useGLTF('/model.glb');
  return <primitive object={scene} />;
};

// In your component:
<Suspense fallback={<LoadingSpinner />}>
  <Heavy3DModel />
</Suspense>
```

#### 5. Memoize Expensive Computations

```jsx
const particles = useMemo(() => {
  return data.map(item => processData(item));
}, [data]);
```

---

## 🎮 WebXR Best Practices

### 1. Feature Detection

```jsx
const [isARSupported, setIsARSupported] = useState(false);

useEffect(() => {
  if (navigator.xr) {
    navigator.xr.isSessionSupported('immersive-ar')
      .then(setIsARSupported);
  }
}, []);
```

### 2. Require HTTPS

WebXR only works on HTTPS (or localhost for development).

```bash
# Development
npm run dev

# Production
# Ensure your deployment uses HTTPS
```

### 3. Handle AR Session Errors

```jsx
const handleEnterAR = async () => {
  try {
    await store.enterAR();
  } catch (error) {
    if (error.name === 'NotSupportedError') {
      alert('AR is not supported on this device');
    } else if (error.name === 'SecurityError') {
      alert('AR requires HTTPS');
    } else {
      alert('Unable to start AR session');
    }
  }
};
```

### 4. Optimize for Mobile

- Keep draw calls low (< 100)
- Use low-poly models
- Compress textures
- Disable shadows if needed
- Use simple shaders

---

## 🚦 Integration with Existing App

### Update Router

Update `src/pages/index.jsx`:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Dashboard from './Dashboard';
import Map from './Map';
import Map3D from './Map3D'; // NEW
import ARExperience from './ARExperience'; // NEW
import Analytics from './Analytics';
import Profile from './Profile';
import Scanner from './Scanner';

export default function Pages() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="map" element={<Map />} />
          <Route path="map3d" element={<Map3D />} /> {/* NEW */}
          <Route path="ar" element={<ARExperience />} /> {/* NEW */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
```

### Add Navigation Buttons

Update `src/pages/Map.jsx` to add 3D/AR buttons:

```jsx
// In the header section, add:
<div className="flex gap-2 flex-shrink-0">
  <Button
    size="sm"
    className="bg-purple-500/80 hover:bg-purple-600/90"
    onClick={() => navigate('/map3d')}
  >
    <Layers className="w-3.5 h-3.5 mr-1.5" />
    3D View
  </Button>
  
  <Button
    size="sm"
    className="bg-blue-500/80 hover:bg-blue-600/90"
    onClick={() => navigate('/ar')}
  >
    <Camera className="w-3.5 h-3.5 mr-1.5" />
    AR
  </Button>
  
  {/* Existing buttons... */}
</div>
```

---

## 🎯 Use Cases for Eco-Trackr

### 1. **3D Air Quality Visualization**
- Real-time PM2.5 concentration spheres
- Color-coded by AQI level
- Floating particle effects
- Interactive tooltips with health info

### 2. **Carbon Emissions Globe**
- Global emissions data on 3D Earth
- Extruded bars by region
- Interactive rotation and zoom
- Time-series animation

### 3. **AR Eco-Activity Gamification**
- Place virtual trees in real world
- AR scavenger hunts for green actions
- Real-time point accumulation
- Social sharing of AR achievements

### 4. **AR Green Space Visualization**
- Overlay park boundaries in AR
- Show tree species and carbon sequestration
- Virtual tour guides
- Educational hotspots

### 5. **3D Journey Replay**
- Visualize past routes in 3D
- Carbon savings as growing trees
- Time-lapse animations
- Shareable 3D achievements

---

## 📚 Resources & References

### Documentation
- [Three.js Docs](https://threejs.org/docs/)
- [React Three Fiber](https://r3f.docs.pmnd.rs/)
- [Drei Helpers](https://drei.docs.pmnd.rs/)
- [React Three XR](https://pmndrs.github.io/xr/docs/)

### Tutorials
- [Creating 3D Weather Visualization with R3F](https://tympanus.net/codrops/)
- [WebXR AR Hit Testing](https://pmndrs.github.io/xr/docs/tutorials/hit-test)
- [3D Data Visualization with React](https://medium.com/cortico/3d-data-visualization-with-react-and-three-js-7272fb6de432)

### Examples
- [React Three Fiber Examples](https://r3f.docs.pmnd.rs/getting-started/examples)
- [Air Quality 3D Globe](https://github.com/shahadpichen/air-quality-index)
- [Carbon Emissions Visualization](https://github.com/JiaqiGao/3D-Visualization-of-Carbon-Emissions)

---

## ✅ Implementation Checklist

### Phase 1: Setup
- [ ] Install dependencies (three, @react-three/fiber, @react-three/drei, @react-three/xr)
- [ ] Update package.json
- [ ] Create component structure

### Phase 2: 3D Visualization
- [ ] Implement AirQuality3D component
- [ ] Create Map3D page
- [ ] Add navigation to 3D view
- [ ] Test performance on mobile

### Phase 3: AR Features
- [ ] Implement ARCanvas wrapper
- [ ] Add HitTestMarker component
- [ ] Create EcoActivityMarker
- [ ] Build ARExperience page
- [ ] Test on AR-capable devices

### Phase 4: Integration
- [ ] Update router with new routes
- [ ] Add navigation buttons to existing pages
- [ ] Test data flow from 2D to 3D
- [ ] Optimize performance

### Phase 5: Polish
- [ ] Add loading states
- [ ] Implement error handling
- [ ] Add user instructions
- [ ] Create onboarding tooltips
- [ ] Performance testing

---

## 🎬 Next Steps

1. **Start with 3D Visualization** (Easier, works on all devices)
   - Implement Air Quality 3D first
   - Test on desktop and mobile
   - Gather user feedback

2. **Add AR Gradually** (More complex, limited device support)
   - Start with simple AR markers
   - Test on AR-capable devices
   - Expand features based on adoption

3. **Iterate Based on Data**
   - Monitor performance metrics
   - Track user engagement
   - Optimize bottlenecks

4. **Community Features**
   - Share 3D achievements
   - AR challenges and competitions
   - Collaborative eco-missions

---

## 💡 Pro Tips

1. **Always test on real devices** - Emulators don't reflect actual AR/3D performance
2. **Start simple** - Add complexity gradually
3. **Optimize early** - Performance matters more than features
4. **Provide fallbacks** - Not all devices support WebXR
5. **Use analytics** - Track which features users actually use

---

This guide provides everything needed to implement Three.js and AR into Eco-Trackr. Start with Phase 1 and build incrementally! 🚀🌱

