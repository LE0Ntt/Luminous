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
  red: number;
  green: number;
  blue: number;
}

const LightBeam: React.FC<LightBeamProps> = ({ red, green, blue }) => {
  const maxColorValue = Math.max(red, green, blue);
  const alpha = maxColorValue / 255;
  const scale = 255 / Math.sqrt((red ** 2 + green ** 2 + blue ** 2) / 3);

  const getRGBA = (opacity: number) => `rgba(${red * scale}, ${green * scale}, ${blue * scale}, ${opacity})`;

  const emitterStyle: React.CSSProperties = {
    boxShadow: `0 0 ${40}px ${20}px ${getRGBA(alpha * 0.7)},
                0 0 ${50}px ${30}px ${getRGBA(alpha * 0.5)},
                0 0 ${60}px ${40}px ${getRGBA(alpha * 0.3)}`,
  };

  const innerGlowStyle: React.CSSProperties = {
    opacity: Math.min(0.9, alpha ** 0.3), // Exponential function for faster fading. Max opacity is 0.9
  };

  return (
    <>
      <div
        className='studioOverviewTraversenLight'
        style={innerGlowStyle}
      />
      <div style={emitterStyle} />
    </>
  );
};

export default LightBeam;
