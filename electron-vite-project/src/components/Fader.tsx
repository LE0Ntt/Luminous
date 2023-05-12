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
    <div className="h-[340px] w-[82px] bg-purple-400 p-4 m-4 relative">
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
        <div className="absolute right-[28px] bottom-[30px]">%</div>
      </div>
      
    </div>
  );
};

export default Fader;
