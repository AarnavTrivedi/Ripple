# Three.js Quick Start Guide 🚀

Get your first 3D visualization running in 15 minutes!

## Step 1: Install Dependencies

```bash
npm install three @react-three/fiber @react-three/drei
```

## Step 2: Create Your First 3D Scene

Create `src/components/three/SimpleScene.jsx`:

```jsx
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, Text } from '@react-three/drei';
import { useRef } from 'react';

// Animated air quality sphere
const FloatingAQISphere = ({ position, aqi, label }) => {
  const meshRef = useRef();
  
  useFrame((state) => {
    // Gentle floating animation
    meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.2;
  });
  
  // Color based on AQI
  const getColor = () => {
    if (aqi <= 50) return '#10b981';
    if (aqi <= 100) return '#fbbf24';
    if (aqi <= 150) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <group ref={meshRef} position={position}>
      <Sphere args={[0.5, 32, 32]}>
        <meshStandardMaterial 
          color={getColor()}
          emissive={getColor()}
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </Sphere>
      
      <Text
        position={[0, 1, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.2}
        color={getColor()}
        anchorX="center"
        anchorY="middle"
      >
        AQI: {aqi}
      </Text>
    </group>
  );
};

// Main scene component
const SimpleAirQualityScene = () => {
  // Mock data - replace with your actual air quality data
  const airQualityPoints = [
    { position: [-2, 1, -2], aqi: 45, label: 'Park' },
    { position: [2, 1, -2], aqi: 85, label: 'Downtown' },
    { position: [0, 1, 2], aqi: 125, label: 'Highway' },
    { position: [-3, 1, 1], aqi: 35, label: 'Forest' },
  ];
  
  return (
    <div className="w-full h-screen bg-gradient-to-b from-slate-900 to-emerald-950">
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <pointLight position={[-10, -10, -10]} color="#10b981" intensity={0.5} />
        
        {/* Air quality spheres */}
        {airQualityPoints.map((point, i) => (
          <FloatingAQISphere
            key={i}
            position={point.position}
            aqi={point.aqi}
            label={point.label}
          />
        ))}
        
        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial 
            color="#1a2f26" 
            transparent 
            opacity={0.5}
          />
        </mesh>
        
        {/* Camera controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      {/* Legend overlay */}
      <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white">
        <h3 className="text-sm font-semibold mb-2">Air Quality</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Good (0-50)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>Moderate (51-100)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500" />
            <span>Unhealthy (101-150)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span>Hazardous (151+)</span>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-white/20 text-xs">
          <p className="text-gray-400">🖱️ Drag to rotate</p>
          <p className="text-gray-400">🔍 Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
};

export default SimpleAirQualityScene;
```

## Step 3: Add Route

Update `src/pages/index.jsx`:

```jsx
import SimpleAirQualityScene from '@/components/three/SimpleScene';

// Add this route:
<Route path="3d-demo" element={<SimpleAirQualityScene />} />
```

## Step 4: Add Navigation Button

In `src/pages/Map.jsx`, add:

```jsx
import { Layers } from 'lucide-react';

// Add this button in your header:
<Button
  size="sm"
  className="bg-purple-500 hover:bg-purple-600"
  onClick={() => window.location.href = '/3d-demo'}
>
  <Layers className="w-4 h-4 mr-2" />
  3D Demo
</Button>
```

## Step 5: Test!

```bash
npm run dev
```

Navigate to `http://localhost:5173/3d-demo` and you should see:
- ✅ Floating 3D spheres representing air quality
- ✅ Color-coded by AQI level
- ✅ Labels with location names
- ✅ Interactive camera controls (drag to rotate, scroll to zoom)
- ✅ Legend overlay

---

## What's Happening?

### 1. **Canvas Component**
```jsx
<Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
```
- Creates WebGL renderer
- Sets up camera position and field of view

### 2. **Lighting**
```jsx
<ambientLight intensity={0.5} />
<pointLight position={[10, 10, 10]} intensity={1} />
```
- Ambient light for general illumination
- Point lights for highlights

### 3. **Custom Component with Animation**
```jsx
useFrame((state) => {
  meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.2;
});
```
- `useFrame` runs every frame (~60fps)
- Creates smooth floating animation

### 4. **Drei Helpers**
```jsx
<Sphere args={[0.5, 32, 32]}>
  <meshStandardMaterial color={getColor()} />
</Sphere>
```
- `<Sphere>` is a pre-built geometry from drei
- `<Text>` for 3D text labels
- `<OrbitControls>` for camera interaction

---

## Next Steps

### Connect Real Data

Replace mock data with your actual air quality data:

```jsx
import { useAirQualityData } from '@/hooks/useAirQualityData';

const SimpleAirQualityScene = () => {
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      }
    );
  }, []);
  
  const { data: airQualityData } = useAirQualityData(userLocation, 5000);
  
  // Transform data to 3D positions
  const airQualityPoints = airQualityData?.map(point => ({
    position: latLonToLocal(point.latitude, point.longitude, userLocation),
    aqi: point.aqi,
    label: point.location
  })) || [];
  
  // ... rest of component
};

// Helper function to convert lat/lon to local 3D coordinates
const latLonToLocal = (lat, lon, centerLat, centerLon) => {
  const metersPerDegree = 111320;
  const x = (lon - centerLon) * metersPerDegree * Math.cos(centerLat * Math.PI / 180);
  const z = -(lat - centerLat) * metersPerDegree;
  return [x / 1000, 1, z / 1000]; // Scale down
};
```

### Add More Features

1. **Click Interaction**
```jsx
<Sphere 
  onClick={() => alert(`AQI: ${aqi}`)}
  onPointerOver={() => setCursor('pointer')}
>
```

2. **Loading State**
```jsx
import { Suspense } from 'react';

<Canvas>
  <Suspense fallback={<LoadingSpinner />}>
    {/* Your 3D content */}
  </Suspense>
</Canvas>
```

3. **Performance Monitoring**
```jsx
import { Stats } from '@react-three/drei';

<Canvas>
  <Stats />
  {/* Shows FPS counter */}
</Canvas>
```

---

## Common Issues & Solutions

### Issue: Black screen
**Solution:** Check browser console for errors. Make sure all imports are correct.

### Issue: Poor performance
**Solution:** 
- Reduce geometry detail (lower segment numbers)
- Use instancing for many objects
- Enable adaptive DPR: `<Canvas dpr={[1, 2]}>`

### Issue: Objects not visible
**Solution:**
- Check camera position
- Add lighting (scene is dark without lights)
- Verify object positions aren't behind camera

### Issue: Controls not working
**Solution:**
- Make sure `<OrbitControls />` is inside `<Canvas>`
- Check for z-index conflicts with overlays

---

## Performance Tips

1. **Use lower polygon counts for mobile:**
```jsx
// Desktop: <Sphere args={[0.5, 32, 32]} />
// Mobile:  <Sphere args={[0.5, 16, 16]} />
```

2. **Memoize expensive calculations:**
```jsx
const processedData = useMemo(() => {
  return airQualityData.map(transformData);
}, [airQualityData]);
```

3. **Use adaptive pixel ratio:**
```jsx
<Canvas dpr={[1, 2]}>
```

---

## Ready for AR?

Once your 3D scene works well, you can add AR by:

1. Installing: `npm install @react-three/xr`
2. Wrapping your scene in `<XR>`
3. Adding AR entry button

See the full implementation guide for details!

---

## Resources

- [React Three Fiber Docs](https://r3f.docs.pmnd.rs/)
- [Drei Helpers](https://drei.docs.pmnd.rs/)
- [Three.js Examples](https://threejs.org/examples/)

Happy coding! 🚀🌱

