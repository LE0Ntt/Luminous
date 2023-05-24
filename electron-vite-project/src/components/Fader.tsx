import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';

interface SliderProps {
  sliderValue?: number;
  id?: number;
  name?: string;
  onSliderChange?: (value: number) => void;
  height?: number;
}

const Fader: React.FC<SliderProps> = ({
  sliderValue = 0,
  id,
  name,
  onSliderChange,
  height,
}) => {
  const { emit } = useConnectionContext();
  const [value, setValue] = useState<number>(sliderValue);
  const valueRef = useRef<number>(sliderValue);
  const isDataSentRef = useRef(false);
  const faderClassName = height ? "fader faderMaster" : "fader";
  const [isDragging, setIsDragging] = useState(false);

  // Farben für den Fader, lightmode und darkmode
  const mainColorLight = "#4F53B1";
  const mainColorDark = "#B9BCFF";

  useEffect(() => {
    setValue(sliderValue);
  }, [sliderValue]);

  useEffect(() => {
    valueRef.current = value;
    isDataSentRef.current = false;
    //console.log('valueRef.current: ' + valueRef.current);
  }, [value]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDataSentRef.current) {
        isDataSentRef.current = true;
        emit("fader_value", { value: valueRef.current });
        console.log('id:' + id, 'valueRef.current:' + valueRef.current, 'isDataSent:' + isDataSentRef.current);
      }
    }, 33);
    return () => clearInterval(interval);
  }, []);
  
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setValue(newValue);
    onSliderChange?.(newValue);
  };

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    newValue = Math.round((newValue / 100) * 255);
    setValue(newValue);
    onSliderChange?.(newValue);
  };

  const displayValue = Math.round((value / 255) * 100);

  useEffect(() => {
    // Setze den Wert der CSS-Variable basierend auf der übergebenen Höhe
    if(height)
      document.documentElement.style.setProperty("--sliderHeight", `${height}px`);
  }, [height]);

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
            background: `linear-gradient(to right, #4F53B1 0%, #4F53B1 ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
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
