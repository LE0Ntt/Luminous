import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';

interface SliderProps {
  sliderValue?: number;
  setSliderValue?: (value: number) => void;   // und das hier
  id?: number;
  name?: string;
  height?: number;
}

const Fader: React.FC<SliderProps> = ({
  sliderValue = 0,
  setSliderValue = () => {},                  // und das hier 
  id,
  name,
  height,
}) => {
  const { emit } = useConnectionContext();
  const [value, setValue] = useState<number>(sliderValue);
  const [isDragging, setIsDragging] = useState(false);
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);
  const [cacheValue, setCacheValue] = useState<number | null>(null);
  const cacheValueRef = useRef<number>(sliderValue);
  const sendValueRef = useRef<number>(sliderValue);
  const faderClassName = height ? "fader faderMaster" : "fader";
  const displayValue = Math.round((value / 255) * 100);

  useEffect(() => {
    if(!isDragging)
      setValue(sliderValue);
  }, [sliderValue]);
  
  // Set fader height by the passed parameter
  useEffect(() => {
    if(height)
      document.documentElement.style.setProperty("--sliderHeight", `${height}px`);
  }, [height]);

  // Always send the last value
  useEffect(() => {
    if(!timerRunning && cacheValueRef.current != null && cacheValueRef.current != sendValueRef.current)
      emit("fader_value", { id: id, value: value });
  }, [timerRunning]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setValue(newValue);
    setSliderValue(newValue);                     // das hier   
    console.log("sliderValueTest: ", sliderValue);    // das hier
    cacheValueRef.current = newValue;

    // Send only at certain time intervals 
    if(!timerRunning) {
      setTimerRunning(true);
      emit("fader_value", { id: id, value: newValue });
      sendValueRef.current = newValue;
      setTimeout(() => {
        setTimerRunning(false);
      }, 20); // Timeout in ms
    }
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    newValue = Math.round((newValue / 100) * 255);
    setValue(newValue);
    emit("fader_value", { id: id, value: newValue });
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
          value={value}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          style={{
            background: `linear-gradient(to right, var(--mainColor) 0%, var(--mainColor) ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
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
        <span className="faderName">{name}</span>
      </div>
    </div>
  );
};

export default Fader;
