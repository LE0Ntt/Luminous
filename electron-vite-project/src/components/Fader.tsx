/**
 * Fader.tsx
 * heißt nur VolumeSlider, weil ich das mal so gemacht habe und es jetzt zu viel Aufwand wäre, das zu ändern
 * @author Leon Hölzel, Darwin Pietas
 */
import React, { useState, ChangeEvent } from "react";
import "./Fader.css";

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
    <div className="fader">
      <div className="midPoint"></div>
      <div className="volume-slider">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={handleVolumeChange}
          style={{ background: `linear-gradient(to right, #4F53B1 0%, #4F53B1 ${volume}%, rgba(40, 40, 40, 0.7) ${volume}%, rgba(40, 40, 40, 0.7) 100%)`}}
          className="slider"
        />
      </div>
      <div>
        <input
        type="number"
        value={volume}
        onChange={handleVolumeChange}
        className="inputNum w-12 h-8 text-right bg-transparent"
        />
        <span className="absolute right-[28px] bottom-[30px] font-extrabold">%</span>
      </div>
    </div>
  );
};

export default Fader;
