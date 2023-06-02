import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import "./Fader.css";
import { useConnectionContext } from './ConnectionContext';

interface SliderProps {
  sliderValue?: number;
  id?: number;
  name?: string;
  height?: number;
}

const Fader: React.FC<SliderProps> = ({
  sliderValue = 0,
  id,
  name,
  height,
}) => {
  const { emit } = useConnectionContext();
  const [value, setValue] = useState<number>(sliderValue);
  const faderClassName = height ? "fader faderMaster" : "fader";
  const [isDragging, setIsDragging] = useState(false);
  const displayValue = Math.round((value / 255) * 100);
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);
  const [cacheValue, setCacheValue] = useState<number | null>(null);
  const [mainColor, setMainColor] = useState("#4F53B1");
  const [isDark, setIsDark] = useState(document.body.classList.contains('dark'));

  useEffect(() => {
    // Dark mode event listener
    const handleDarkModeChange = () => setIsDark(document.body.classList.contains('dark'));
    document.body.addEventListener('class-change', handleDarkModeChange);
    return () => document.body.removeEventListener('class-change', handleDarkModeChange);
  }, []);

  useEffect(() => {
    isDark ? setMainColor("#B9BCFF") : setMainColor("#4F53B1");
  }, [isDark]);

  useEffect(() => {
    if(!isDragging)
      setValue(sliderValue);
  }, [sliderValue]);
  
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setValue(newValue);
    setCacheValue(newValue);
    if(!timerRunning) {
      setTimerRunning(true);
      emit("fader_value", { id: id, value: newValue });
      setTimeout(() => {
        setTimerRunning(false);
      }, 20); // Timeout in ms
    }
  };

  useEffect(() => {
    if(!timerRunning && cacheValue != null)
    emit("fader_value", { id: id, value: cacheValue });
  }, [timerRunning]);

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 100);
    newValue = Math.round((newValue / 100) * 255);
    setValue(newValue);
    emit("fader_value", { id: id, value: newValue });
  };

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
            background: `linear-gradient(to right, ${mainColor} 0%, ${mainColor} ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
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
