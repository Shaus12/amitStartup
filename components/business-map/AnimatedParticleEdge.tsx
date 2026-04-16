import React from 'react';
import { BaseEdge, type EdgeProps, getSmoothStepPath } from '@xyflow/react';

export function AnimatedParticleEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}: EdgeProps) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const baseColor = (data?.color as string) ?? "#4d8eff";
  const mutedColor = `${baseColor}30`;
  
  return (
    <>
      <BaseEdge 
        path={edgePath} 
        style={{ ...style, stroke: mutedColor, strokeWidth: 1.5 }} 
        markerEnd={markerEnd} 
      />
      <circle 
        r="3" 
        fill={baseColor} 
        style={{ 
          filter: `drop-shadow(0 0 6px ${baseColor}) drop-shadow(0 0 2px #fff)`,
          opacity: 0.8
        }}
      >
        <animateMotion dur={`${(data?.duration || 3) as number}s`} repeatCount="indefinite" path={edgePath} />
      </circle>
    </>
  );
}
