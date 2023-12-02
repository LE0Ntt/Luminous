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
import { useState, ChangeEvent, useEffect, useRef } from 'react';
import './Fader.css';
import { useConnectionContext } from './ConnectionContext';
import { useFaderContext } from './FaderContext';

interface SliderProps {
  id: number;
  sliderGroupId: number;
  name?: string;
  height?: number;
  className?: string;
  color?: string;
}

const Fader: React.FC<SliderProps> = ({ id, sliderGroupId, name, height, className, color }) => {
  // Initialize context and state
  const { emit } = useConnectionContext();
  const { faderValues, setFaderValue } = useFaderContext();
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Refs to keep track of fader values and if they need to be sent
  const cacheValueRef = useRef<number>(faderValues[sliderGroupId][id]);
  const sendValueRef = useRef<number>(faderValues[sliderGroupId][id]);

  // Generate dynamic class names for the fader
  const faderClassName = `fader ${height ? 'faderMaster' : ''} ${className}`;

  // Calculating the display value (0 to 100%) and update input value
  const displayValue = Math.round((faderValues[sliderGroupId][id] / 255) * 100);
  const [inputValue, setInputValue] = useState<any>(displayValue);

  useEffect(() => {
    setInputValue(displayValue);
  }, [displayValue]);

  // Emit fader value to the server
  const emitValue = (value: number) => {
    emit('fader_value', { deviceId: sliderGroupId, value: value, channelId: id });
    sendValueRef.current = value;
  };

  // Set fader height by the passed parameter //v1.0.3pre, removed useEffect, because it was not needed
  if (height) {
    document.documentElement.style.setProperty('--sliderHeight', `${height}px`);
  }

  // Always send the last value
  useEffect(() => {
    if (!timerRunning && cacheValueRef.current != null && cacheValueRef.current != sendValueRef.current)
      emit('fader_value', { deviceId: sliderGroupId, value: faderValues[sliderGroupId][id], channelId: id });
  }, [timerRunning]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setFaderValue(sliderGroupId, id, newValue);
    cacheValueRef.current = newValue;

    // Send only at certain time intervals
    if (!timerRunning) {
      setTimerRunning(true);
      emitValue(newValue);
      setTimeout(() => {
        setTimerRunning(false);
      }, 20); // Timeout in ms
    }
  };

  // Check if the input value is a number
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 5) {
      setInputValue(value.replace(/[^0-9.,]+/g, ''));
    }
  };

  // Check if the input is valid and set the fader value
  const handleInputConfirm = () => {
    let numericValue = parseFloat(inputValue.replace(',', '.'));
    if (!isNaN(numericValue)) {
      numericValue = Math.max(0, Math.min(100, numericValue));
      const scaledValue = Math.round((numericValue / 100) * 255);
      setFaderValue(sliderGroupId, id, scaledValue);
      emitValue(scaledValue);
      setInputValue(Math.round(numericValue).toString());
    } else {
      setInputValue(displayValue); // Reset value if input is NaN
    }
  };

  // Confirm with ENTER
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  };

  // Scroll wheel and arrow keys support
  useEffect(() => {
    const updateFaderValue = (delta: number) => {
      const currentValue = faderValues[sliderGroupId][id];
      let newValue = Math.max(0, Math.min(currentValue + delta, 255));
      setFaderValue(sliderGroupId, id, newValue);
      emitValue(newValue);
    };

    const handleWheel = (event: { preventDefault: () => void; ctrlKey: any; deltaY: number }) => {
      if (!isHovered) return;
      event.preventDefault();
      const step = event.ctrlKey ? 10 : 1; // If CTRL is pressed, increase/decrease by 10, otherwise by 1
      updateFaderValue(-Math.sign(event.deltaY) * step);
    };

    const handleKeyDown = (event: { key: string; preventDefault: () => void; ctrlKey: any }) => {
      if (!isHovered) return;
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        const step = event.ctrlKey ? 10 : 1;
        updateFaderValue((event.key === 'ArrowUp' ? 1 : -1) * step);
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isHovered]);

  return (
    <div
      className={faderClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='midPoint'></div>
      <div className='value-slider'>
        <input
          type='range'
          min='0'
          max='255'
          step='1'
          value={faderValues[sliderGroupId][id]}
          onChange={handleSliderChange}
          style={{
            background: color
              ? `linear-gradient(to right, ${color} 0%, ${color} ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`
              : `linear-gradient(to right, var(--mainColor) 0%, var(--mainColor) ${displayValue}%, rgba(40, 40, 40, 0.7) ${displayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
          }}
          className='slider sliderTrackColor'
        />
      </div>
      <div className='valueDisplay'>
        <input
          type='text'
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputConfirm}
          onKeyDown={handleKeyDown}
          className='inputNum'
          style={{ width: `${Math.max(1, inputValue.toString().length)}ch` }}
        />
        <span className='inputNumPercent'>%</span>
      </div>
      <span
        title={name}
        className='faderName'
      >
        {name}
      </span>
    </div>
  );
};

export default Fader;
