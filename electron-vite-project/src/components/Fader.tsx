/**
 * Fader.tsx
 * heißt nur VolumeSlider, weil ich das mal so gemacht habe und es jetzt zu viel Aufwand wäre, das zu ändern
 * @author Leon Hölzel
 */
import React, { useState, ChangeEvent } from "react";
import "./VolumeSlider.css";

interface VolumeSliderProps {
  initialVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

const Fader: React.FC<VolumeSliderProps> = ({
  initialVolume = 50,
  onVolumeChange,
}) => {
  const [volume, setVolume] = useState<number>(initialVolume);

  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
    if (onVolumeChange) {
      onVolumeChange(newVolume);
    }
  };

  return (
    <div>
      <div className="volume-slider h-[300px]">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={handleVolumeChange}
          className="slider"
        />
        <span>{volume}%</span>
      </div>
    </div>
  );
};

export default Fader;
