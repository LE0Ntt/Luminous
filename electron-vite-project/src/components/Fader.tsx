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
 * @file Fader.tsx
 */
import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';
import { useFaderContext } from './FaderContext';

interface SliderProps {
  id: number;
  sliderGroupId: number;
  name?: string;
  height?: number;
  className ?: string;
  color?: string;
}

const Fader: React.FC<SliderProps> = ({
  id,
  sliderGroupId,
  name,
  height,
  className,
  color,
}) => {
  const { emit } = useConnectionContext();
  const { faderValues, setFaderValue } = useFaderContext();
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);
  const cacheValueRef = useRef<number>(faderValues[sliderGroupId][id]);
  const sendValueRef = useRef<number>(faderValues[sliderGroupId][id]);
  const faderClassName = height ? `fader faderMaster ${className}` : `fader ${className}`;
  const displayValue = Math.round((faderValues[sliderGroupId][id] / 255) * 100);

  // Set fader height by the passed parameter
  useEffect(() => {
    if(height)
      document.documentElement.style.setProperty("--sliderHeight", `${height}px`);
  }, [height]);

  // Always send the last value
  useEffect(() => {
    if(!timerRunning && cacheValueRef.current != null && cacheValueRef.current != sendValueRef.current)
      emit("fader_value", { deviceId: sliderGroupId, value: faderValues[sliderGroupId][id], channelId: id });
  }, [timerRunning]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setFaderValue(sliderGroupId, id, newValue);
    cacheValueRef.current = newValue;

    // Send only at certain time intervals 
    if(!timerRunning) {
      setTimerRunning(true);
      emit("fader_value", { deviceId: sliderGroupId, value: newValue, channelId: id });
      sendValueRef.current = newValue;
      setTimeout(() => {
        setTimerRunning(false);
      }, 20); // Timeout in ms
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    newValue = Math.round((newValue / 100) * 255);
    setFaderValue(sliderGroupId, id, newValue);
    emit("fader_value", { deviceId: sliderGroupId, value: newValue, channelId: (id)});
  };

  return (
    <div className={faderClassName}>
      <div className="midPoint"></div>
      <div className="value-slider">
        <input
          type="range"
          min="0"
          max="255"
          step="1"
          value={faderValues[sliderGroupId][id]}
          onChange={handleSliderChange}
          style={{
            background: color ? `linear-gradient(to right, ${color} 0%, ${color} ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)` : `linear-gradient(to right, var(--mainColor) 0%, var(--mainColor) ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
          }}
          className="slider sliderTrackColor"
        />
      </div>
      <div>
        <input
          type="number"
          value={displayValue}
          onChange={handleInput}
          className="inputNum"
          min="0"
          max="100"
        />
        <span className="inputNumPercent">%</span>
        <span title={name} className="faderName">{name}</span>
      </div>
    </div>
  );
};

export default Fader;
