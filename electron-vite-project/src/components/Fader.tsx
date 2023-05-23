import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';

interface VolumeSliderProps {
  initialVolume?: number;
  id?: number;
  name?: string;
  onVolumeChange?: (volume: number) => void;
  height?: number;
}

const Fader: React.FC<VolumeSliderProps> = ({
  initialVolume = 0,
  id,
  name,
  onVolumeChange,
  height,
}) => {
  const { emit } = useConnectionContext();
  const [volume, setVolume] = useState<number>(initialVolume);
  const volumeRef = useRef<number>(initialVolume);
  const isDataSentRef = useRef(false);
  const faderClassName = height ? "fader faderMaster" : "fader";

  // Farben für den Fader, lightmode und darkmode
  const mainColorLight = "#4F53B1";
  const mainColorDark = "#B9BCFF";

  useEffect(() => {
    setVolume(initialVolume);
  }, [initialVolume]);

  useEffect(() => {
    volumeRef.current = volume;
    isDataSentRef.current = false;
    //console.log('volumeRef.current: ' + volumeRef.current);
  }, [volume]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDataSentRef.current) {
        isDataSentRef.current = true;
        emit("fader_value", { value: volumeRef.current });
        console.log('id:' + id, 'volumeRef.current:' + volumeRef.current, 'isDataSent:' + isDataSentRef.current);
      }
    }, 33);
    return () => clearInterval(interval);
  }, []);
  
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newVolume = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let value = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    let newVolume = Math.round((value / 100) * 255);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const displayVolume = Math.round((volume / 255) * 100);

  useEffect(() => {
    // Setze den Wert der CSS-Variable basierend auf der übergebenen Höhe
    if(height)
      document.documentElement.style.setProperty("--sliderHeight", `${height}px`);
  }, [height]);

  return (
    <div className={faderClassName}>
      <div className="midPoint"></div>
      <div className="volume-slider">
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={volume}
          onChange={handleVolumeChange}
          style={{
            background: `linear-gradient(to right, #4F53B1 0%, #4F53B1 ${displayVolume}%, rgba(40, 40, 40, 0.7) ${displayVolume}%, rgba(40, 40, 40, 0.7) 100%)`,
          }}
          className="slider sliderTrackColor"
        />
      </div>
      <div>
        <input
          type="number"
          value={displayVolume}
          onChange={handleInput}
          className="inputNum"
          min="0"
          max="100"
        />
        <span className="inputNumPercent">%</span>
        <span className="faderName">{name}</span>
      </div>
    </div>
  );
};

export default Fader;
