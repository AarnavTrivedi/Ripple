import { useMemo } from 'react';
import { Text, Box } from '@react-three/drei';
import * as THREE from 'three';

// Visual representation of environmental impact statistics
const ImpactVisualization = ({ userStats, communityStats, position = [0, 0, 0] }) => {
  // Create bar chart data
  const stats = useMemo(() => {
    return [
      {
        label: 'Your CO₂ Saved',
        value: userStats?.carbonSaved || 0,
        color: '#10b981',
        maxValue: 100
      },
      {
        label: 'Community CO₂',
        value: communityStats?.carbonSaved || 0,
        color: '#22c55e',
        maxValue: 1000
      },
      {
        label: 'Green Miles',
        value: userStats?.greenMiles || 0,
        color: '#3b82f6',
        maxValue: 50
      },
      {
        label: 'Actions Done',
        value: userStats?.actionsCompleted || 0,
        color: '#fbbf24',
        maxValue: 20
      }
    ];
  }, [userStats, communityStats]);
  
  return (
    <group position={position}>
      {/* Title */}
      <Text
        position={[0, 3, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        Your Environmental Impact
      </Text>
      
      {/* 3D Bar Chart */}
      {stats.map((stat, index) => {
        const barHeight = (stat.value / stat.maxValue) * 2;
        const xPos = (index - 1.5) * 1.2;
        
        return (
          <group key={index} position={[xPos, 0, 0]}>
            {/* Bar */}
            <Box 
              args={[0.8, barHeight, 0.8]} 
              position={[0, barHeight / 2, 0]}
            >
              <meshStandardMaterial 
                color={stat.color}
                emissive={stat.color}
                emissiveIntensity={0.3}
              />
            </Box>
            
            {/* Value label */}
            <Text
              position={[0, barHeight + 0.3, 0]}
              fontSize={0.2}
              color={stat.color}
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              {stat.value.toFixed(1)}
            </Text>
            
            {/* Stat label */}
            <Text
              position={[0, -0.3, 0]}
              fontSize={0.12}
              color="#a0a0a0"
              anchorX="center"
              anchorY="middle"
              maxWidth={1}
            >
              {stat.label}
            </Text>
          </group>
        );
      })}
      
      {/* Comparison text */}
      <Text
        position={[0, -1, 0]}
        fontSize={0.15}
        color="#10b981"
        anchorX="center"
        anchorY="middle"
      >
        You're in the top {calculatePercentile(userStats, communityStats)}% of eco-warriors!
      </Text>
    </group>
  );
};

// Calculate user's percentile in community
const calculatePercentile = (userStats, communityStats) => {
  if (!userStats || !communityStats) return 50;
  
  const userTotal = (userStats.carbonSaved || 0) + (userStats.actionsCompleted || 0) * 5;
  const communityAvg = (communityStats.carbonSaved || 0) / (communityStats.users || 1);
  
  if (userTotal >= communityAvg * 2) return 10;
  if (userTotal >= communityAvg * 1.5) return 25;
  if (userTotal >= communityAvg) return 50;
  return 75;
};

export default ImpactVisualization;

