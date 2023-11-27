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
 * @file LightBeam.tsx
 */
import React from 'react';

interface LightBeamProps {
  red: number;
  green: number;
  blue: number;
}

const LightBeam: React.FC<LightBeamProps> = ({ red, green, blue }) => {
  const maxColorValue = Math.max(red, green, blue);
  const alpha = maxColorValue / 255;

  const emitterStyle: React.CSSProperties = {
    width: '1px',
    height: '1px',
    borderRadius: '50%',
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 1)`,
    boxShadow: `0 0 ${80 / 2}px ${40 / 2}px rgba(${red}, ${green}, ${blue}, ${alpha * 0.7}),
              0 0 ${120 / 2}px ${80 / 2}px rgba(${red}, ${green}, ${blue}, ${alpha * 0.5}),
              0 0 ${200 / 3}px ${160 / 3}px rgba(${red}, ${green}, ${blue}, ${alpha * 0.3})`,
  };

  return (
    <>
      <div style={emitterStyle} />
    </>
  );
};

export default LightBeam;
