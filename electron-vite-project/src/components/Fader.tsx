import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';

interface VolumeSliderProps {
  initialVolume?: number;
  onVolumeChange?: (volume: number) => void;
}

const Fader: React.FC<VolumeSliderProps> = ({
  initialVolume = 0,
  onVolumeChange,
}) => {
  const { emit, on, off } = useConnectionContext();
  const [volume, setVolume] = useState<number>(initialVolume);
  const volumeRef = useRef<number>(initialVolume);
  const isDataSentRef = useRef(false);

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
        console.log('volumeRef.current: ' + volumeRef.current, 'isDataSent: ' + isDataSentRef.current);
      }
    }, 33);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const eventListener = (data: any) => {
      console.log("Received data from server:", data);
      // Hier kannst du den Slider-Wert aktualisieren
      setVolume(data.value);
    };
    
    on("variable_update", eventListener);
  
    // Funktion zum Entfernen des Event-Listeners
    const removeEventListener = () => {
      off("variable_update", eventListener);
    };
  
    return removeEventListener;
  }, [on]);
  
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

  return (
    <div className="fader">
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
          className="slider"
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
      </div>
    </div>
  );
};

export default Fader;
