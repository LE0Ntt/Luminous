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
import React, { useState, ChangeEvent, useEffect, useRef, useCallback } from 'react';
import './Fader.css';
import { useConnectionContext } from './ConnectionContext';
import { useFaderValue, useFaderContext } from './FaderContext';

interface SliderProps {
  id: number;
  sliderGroupId: number;
  name?: string;
  number?: number;
  height?: number;
  className?: string;
  color?: string;
}

const Fader: React.FC<SliderProps> = React.memo(({ id, sliderGroupId, name, number, height, className, color }) => {
  const { emit } = useConnectionContext();
  const { setFaderValue } = useFaderContext();
  const faderValue = useFaderValue(sliderGroupId, id);

  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const cacheValueRef = useRef<number>(faderValue);
  const sendValueRef = useRef<number>(faderValue);

  const scaledDisplayValue = (faderValue / 255) * 100;
  const [inputValue, setInputValue] = useState<any>(Math.round(scaledDisplayValue) + '%');

  useEffect(() => {
    const finalDisplayValue = isFocused ? scaledDisplayValue.toFixed(1) : Math.round(scaledDisplayValue) + '%';
    setInputValue(finalDisplayValue);
  }, [scaledDisplayValue, isFocused]);

  const emitValue = useCallback(
    (value: number) => {
      emit('fader_value', { deviceId: sliderGroupId, value: value, channelId: id });
      sendValueRef.current = value;
    },
    [emit, sliderGroupId, id]
  );

  useEffect(() => {
    if (!timerRunning && cacheValueRef.current != null && cacheValueRef.current !== sendValueRef.current) {
      emitValue(faderValue);
    }
  }, [timerRunning, emitValue, faderValue]);

  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
      setFaderValue(sliderGroupId, id, newValue);
      cacheValueRef.current = newValue;

      if (!timerRunning) {
        setTimerRunning(true);
        emitValue(newValue);
        setTimeout(() => {
          setTimerRunning(false);
        }, 20); // Timeout in ms
      }
    },
    [setFaderValue, sliderGroupId, id, timerRunning, emitValue]
  );

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 5) {
      setInputValue(value.replace(/[^0-9.,]+/g, ''));
    }
  }, []);

  const handleInputConfirm = useCallback(() => {
    let numericValue = parseFloat(inputValue.toString().replace(',', '.'));
    if (!isNaN(numericValue)) {
      numericValue = Math.max(0, Math.min(100, numericValue));
      const scaledValue = Math.round((numericValue / 100) * 255);
      setFaderValue(sliderGroupId, id, scaledValue);
      emitValue(scaledValue);
      const roundedDisplayValue = Math.round(numericValue);
      setInputValue(roundedDisplayValue);
    } else {
      setInputValue(Math.round(scaledDisplayValue));
    }
    setIsFocused(false);
  }, [inputValue, scaledDisplayValue, setFaderValue, sliderGroupId, id, emitValue]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  }, []);

  useEffect(() => {
    const updateFaderValue = (delta: number) => {
      const currentValue = faderValue;
      let newValue = Math.max(0, Math.min(currentValue + delta, 255));
      setFaderValue(sliderGroupId, id, newValue);
      emitValue(newValue);
    };

    const handleWheel = (event: WheelEvent) => {
      if (!isHovered) return;
      event.preventDefault();
      const step = event.ctrlKey ? 10 : 1;
      updateFaderValue(-Math.sign(event.deltaY) * step);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [isHovered, faderValue, setFaderValue, sliderGroupId, id, emitValue]);

  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    setTimeout(() => {
      event.target.select();
    }, 50);
  }, []);

  const backgroundColor = color || 'var(--mainColor)';
  const gradientStyle = {
    background: `linear-gradient(to right, ${backgroundColor} 0%, ${backgroundColor} ${scaledDisplayValue}%, rgba(40, 40, 40, 0.7) ${scaledDisplayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
  };

  return (
    <div
      className={`fader ${height && 'faderMaster'} ${number && 'numberAlign'} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--sliderHeight': `${height}px` } as React.CSSProperties}
    >
      {number && <h2 className='faderText'>{number}</h2>}
      <div className='midPoint'></div>
      <div className='value-slider'>
        <input
          type='range'
          min='0'
          max='255'
          step='1'
          value={faderValue}
          onChange={handleSliderChange}
          style={gradientStyle}
          className='slider'
        />
      </div>
      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onBlur={handleInputConfirm}
        onKeyDown={handleKeyDown}
        className='inputNum'
      />
      <span
        title={name}
        className='faderName'
      >
        {name}
      </span>
    </div>
  );
});

export default Fader;
