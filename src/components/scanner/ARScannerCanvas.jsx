import { XR, createXRStore } from '@react-three/xr';
import { Canvas } from '@react-three/fiber';
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Scan } from 'lucide-react';

const ARScannerCanvas = ({ children, mode = '3d' }) => {
  // Create XR store using useMemo to prevent recreation on each render
  const store = useMemo(() => createXRStore(), []);
  
  const [isARSupported, setIsARSupported] = useState(true);
  const [isInAR, setIsInAR] = useState(false);
  const [error, setError] = useState(null);
  
  // Check AR support
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar')
        .then((supported) => {
          setIsARSupported(supported);
          if (!supported) {
            console.log('AR not supported on this device');
          }
        })
        .catch((err) => {
          console.error('Error checking AR support:', err);
          setIsARSupported(false);
        });
    } else {
      setIsARSupported(false);
    }
  }, []);
  
  // Monitor XR session state
  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      setIsInAR(state.session !== null);
    });
    return () => unsubscribe();
  }, [store]);
  
  const handleEnterAR = async () => {
    try {
      setError(null);
      await store.enterAR();
    } catch (error) {
      console.error('Error entering AR:', error);
      let errorMessage = 'Unable to start AR.';
      
      if (error.name === 'NotSupportedError') {
        errorMessage = 'AR is not supported on this device.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'AR requires HTTPS. Please use a secure connection.';
      } else if (error.name === 'NotAllowedError') {
        errorMessage = 'AR permission was denied. Please allow camera access.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    }
  };
  
  const handleExitAR = async () => {
    try {
      await store.exitAR();
    } catch (error) {
      console.error('Error exiting AR:', error);
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {/* AR Error Message */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-red-500/90 text-white p-4 rounded-lg shadow-lg">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* AR Entry Button - Only show in 3D mode when not in AR */}
      {mode === '3d' && !isInAR && isARSupported && (
        <div className="absolute top-4 right-4 z-40">
          <Button
            onClick={handleEnterAR}
            className="bg-emerald-500/90 hover:bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-sm"
          >
            <Camera className="w-4 h-4 mr-2" />
            Enter AR
          </Button>
        </div>
      )}
      
      {/* Exit AR Button */}
      {isInAR && (
        <div className="absolute top-4 right-4 z-50">
          <Button
            onClick={handleExitAR}
            className="bg-red-500/90 hover:bg-red-600 text-white rounded-full p-3 shadow-lg"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
      
      {/* Scanner UI Overlay - Show when in AR */}
      {isInAR && (
        <div className="absolute bottom-4 left-4 right-4 z-40 bg-black/60 backdrop-blur-md rounded-lg p-4 text-white">
          <div className="flex items-center gap-3">
            <Scan className="w-5 h-5 text-emerald-400 animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-semibold">AR Scanner Active</p>
              <p className="text-xs text-gray-300">Point at surfaces to discover eco-activities</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Three.js Canvas with XR */}
      <Canvas
        camera={{ position: [0, 1.6, 0], fov: 60 }}
        gl={{ 
          antialias: true, 
          alpha: true,
          preserveDrawingBuffer: true 
        }}
        style={{ 
          touchAction: 'none',
          width: '100%',
          height: '100%'
        }}
      >
        <XR store={store}>
          {/* Lighting for 3D/AR */}
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[-5, 5, -5]} color="#10b981" intensity={0.5} />
          
          {children}
        </XR>
      </Canvas>
    </div>
  );
};

export default ARScannerCanvas;

