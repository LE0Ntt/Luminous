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

interface LightBeamProps {
  master: number;
  red: number;
  green: number;
  blue: number;
}

const LightBeam: React.FC<LightBeamProps> = ({ master, red, green, blue }) => {
  const scaledMaster = master / 255;
  const maxColorValue = Math.max(red, green, blue);
  const alpha = maxColorValue / 255;
  const scale = 255 / Math.sqrt((red ** 2 + green ** 2 + blue ** 2) / 3);

  const getRGBA = (opacity: number) => `rgba(${red * scale}, ${green * scale}, ${blue * scale}, ${opacity})`;

  const emitterStyle: React.CSSProperties = {
    boxShadow: `0 0 ${40}px ${20}px ${getRGBA(alpha * 0.7 * scaledMaster)},
                0 0 ${50}px ${30}px ${getRGBA(alpha * 0.5 * scaledMaster)},
                0 0 ${60}px ${40}px ${getRGBA(alpha * 0.3 * scaledMaster)}`,
  };

  const innerGlowStyle: React.CSSProperties = {
    opacity: Math.min(0.9, alpha ** 0.3), // Exponential function for faster fading. Max opacity is 0.9
  };

  const shouldHide = (red === 0 && green === 0 && blue === 0) || master === 0;

  return (
    <>
      <div
        className={`studioOverviewTraversenLight ${shouldHide ? 'hide' : ''}`}
        style={innerGlowStyle}
      />
      <div
        className={`emitter ${shouldHide ? 'hide' : ''}`}
        style={emitterStyle}
      />
    </>
  );
};

export default LightBeam;
