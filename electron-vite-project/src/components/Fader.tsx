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
  // Initialize context and state
  const { emit } = useConnectionContext();
  const { faderValues, setFaderValue } = useFaderContext();
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);

  // Refs to keep track of fader values and if they need to be sent
  const cacheValueRef = useRef<number>(faderValues[sliderGroupId][id]);
  const sendValueRef = useRef<number>(faderValues[sliderGroupId][id]);

  // Generate dynamic class names for the fader
  const faderClassName = `fader ${height ? 'faderMaster' : ''} ${className}`;

  // Calculating the display value (0 to 100%)
  const displayValue = Math.round((faderValues[sliderGroupId][id] / 255) * 100);

  // Emit fader value to the server
  const emitValue = (value: number) => {
    emit("fader_value", { deviceId: sliderGroupId, value: value, channelId: id });
    sendValueRef.current = value;
  }

  // Set fader height by the passed parameter //v1.0.3pre, removed useEffect, because it was not needed
  if(height) {
    document.documentElement.style.setProperty("--sliderHeight", `${height}px`);
  }

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
      emitValue(newValue);
      setTimeout(() => {
        setTimerRunning(false);
      }, 20); // Timeout in ms
    }
  };

  // Handle change on the percentage input (text box)
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    newValue = Math.round((newValue / 100) * 255);
    setFaderValue(sliderGroupId, id, newValue);
    emitValue(newValue);
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
