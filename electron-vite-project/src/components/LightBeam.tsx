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

import React, { useMemo } from 'react';

interface LightBeamProps {
  master: number;
  main: number;
  red: number;
  green: number;
  blue: number;
}

const LightBeam: React.FC<LightBeamProps> = ({ master, main, red, green, blue }) => {
  const { shouldHide, emitterStyle, innerGlowStyle } = useMemo(() => {
    const hide = (red === 0 && green === 0 && blue === 0) || main === 0 || master === 0;
    if (hide) {
      return {
        shouldHide: true,
        emitterStyle: {},
        innerGlowStyle: {},
      };
    }

    const scaledMaster = master / 255;
    const scaledMain = main / 255;
    const maxColorValue = Math.max(red, green, blue);
    const alpha = maxColorValue / 255;
    const scale = 255 / Math.sqrt((red ** 2 + green ** 2 + blue ** 2) / 3);

    const scaledRed = Math.min(255, Math.max(0, red * scale));
    const scaledGreen = Math.min(255, Math.max(0, green * scale));
    const scaledBlue = Math.min(255, Math.max(0, blue * scale));

    const getRGBA = (opacity: number) => {
      const adjustedAlpha = Math.min(1, Math.max(0, opacity));
      return `rgba(${scaledRed}, ${scaledGreen}, ${scaledBlue}, ${adjustedAlpha})`;
    };

    return {
      shouldHide: false,
      emitterStyle: {
        boxShadow: `0 0 ${40}px ${20}px ${getRGBA(alpha * 0.7 * scaledMain * scaledMaster)},
                    0 0 ${50}px ${30}px ${getRGBA(alpha * 0.5 * scaledMain * scaledMaster)},
                    0 0 ${60}px ${40}px ${getRGBA(alpha * 0.3 * scaledMain * scaledMaster)}`,
      },
      innerGlowStyle: {
        opacity: Math.min(0.9, scaledMain * scaledMaster + 0.2),
      },
    };
  }, [master, main, red, green, blue]);

  return (
    <>
      <div
        className={`studioOverviewTraversenLight no-transition ${shouldHide ? 'hide' : ''}`}
        style={innerGlowStyle}
      />
      <div
        className={`emitter no-transition ${shouldHide ? 'hide' : ''}`}
        style={emitterStyle}
      />
    </>
  );
};

export default LightBeam;
