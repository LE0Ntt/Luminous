/**
 * Luminous - A Web-Based Lighting Control System
 * 
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 * 
 * Authors:
 * - Leon Hölzel
 * - Darwin Pietas
 * - Marvin Plate
 * - Andree Tomek
 * 
 * @file GridLines.tsx
 */
import React from 'react';

const GridLines = React.memo(({ height }: { height: number }) => (
    <div>
      <svg width="100%" height={`${height}px`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect
          width="100%" 
          height={`${height}px`} 
          rx="4.75" 
          stroke="var(--faderBorder)"  
          strokeWidth="1" 
          strokeDasharray="20 20"
          shapeRendering="geometricPrecision"
        />
      </svg>
    </div>
  ));
  
  export default GridLines;
