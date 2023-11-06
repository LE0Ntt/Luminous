import React, { useState } from 'react';

const LightBeam: React.FC = () => {
  const [red, setRed] = useState<number>(255);
  const [green, setGreen] = useState<number>(255);
  const [blue, setBlue] = useState<number>(255);

  const updateColor = (colorSetter: React.Dispatch<React.SetStateAction<number>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    colorSetter(Number(e.target.value));
  };

  // rgba wird für die Hintergrundfarbe mit Transparenz verwendet.
  const emitterStyle: React.CSSProperties = {
    width: '1px', // Kleine Box-Breite
    height: '1px', // Kleine Box-Höhe
    borderRadius: '50%', // Macht die Box kreisförmig
    backgroundColor: `rgba(${red}, ${green}, ${blue}, 1)`, // Farbe der Box ohne Transparenz
    boxShadow: `0 0 80px 40px rgba(${red}, ${green}, ${blue}, 0.7),
                0 0 120px 80px rgba(${red}, ${green}, ${blue}, 0.5),
                0 0 200px 160px rgba(${red}, ${green}, ${blue}, 0.3)`, // Mehrschichtiger Schatten für einen sanfteren Übergang
    margin: '100px', // Erhöhter Abstand um den großen Schatten zu sehen
  };

  return (
    <div>
      <div style={emitterStyle} />
      <label>
        Rot
        <input
          type='range'
          value={red}
          onChange={updateColor(setRed)}
          min='0'
          max='255'
        />
      </label>
      <label>
        Grün
        <input
          type='range'
          value={green}
          onChange={updateColor(setGreen)}
          min='0'
          max='255'
        />
      </label>
      <label>
        Blau
        <input
          type='range'
          value={blue}
          onChange={updateColor(setBlue)}
          min='0'
          max='255'
        />
      </label>
    </div>
  );
};

export default LightBeam;
