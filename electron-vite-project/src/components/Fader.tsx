/**
 * Fader.tsx
 * heißt nur VolumeSlider, weil ich das mal so gemacht habe und es jetzt zu viel Aufwand wäre, das zu ändern
 * @author Leon Hölzel, Darwin Pietas
 */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useVolume } from './FaderValue_Handler'; /** Test */

interface VolumeSliderProps {
  initialVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

const Fader: React.FC<VolumeSliderProps> = ({
  initialVolume = 0,
  onVolumeChange,
}) => {
  const [volume1, setVolume] = useState<number>(initialVolume);

  // Test zum Senden der Daten an den Server
  const { volume, sendVolumeToServer } = useVolume(); 
  const volumeRef = useRef<number>(initialVolume);
  const isDataSentRef = useRef(false);

  useEffect(() => {
    console.log('volume: ' + volume);
    setVolume(volume);
  }, [volume]);

  useEffect(() => {
    volumeRef.current = volume1;
    isDataSentRef.current = false;
    //console.log('volumeRef.current: ' + volumeRef.current);
  }, [volume1]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDataSentRef.current) {
        isDataSentRef.current = true;
        sendVolumeToServer(volumeRef.current);
        console.log('volumeRef.current: ' + volumeRef.current, 'isDataSent: ' + isDataSentRef.current);
      }
    }, 33);
    return () => clearInterval(interval);
  }
  , []);
  // Test end
  const handleVolumeChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newVolume = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setVolume(newVolume);
    onVolumeChange?.(newVolume);
  };

  const displayVolume = Math.round((volume1 / 255) * 100);

  return (
    <div className="fader">
      <div className="midPoint"></div>
      <div className="volume-slider">
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={volume1}
          onChange={handleVolumeChange}
          style={{
            background: `linear-gradient(to right, #4F53B1 0%, #4F53B1 ${displayVolume}%, rgba(40, 40, 40, 0.7) ${displayVolume}%, rgba(40, 40, 40, 0.7) 100%)`,
          }}
          className="slider"
        />
      </div>
      <div>
        <input
          type="number"
          value={displayVolume}
          onChange={handleVolumeChange}
          className="inputNum w-12 h-8 text-right bg-transparent"
          min="0"
          max="100"
        />
        <span className="absolute right-[28px] bottom-[30px] font-extrabold">%</span>
      </div>
    </div>
  );
};

export default Fader;
