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
import React, { useState, ChangeEvent, useEffect, useCallback, useRef } from 'react';
import './Fader.css';
import { useConnectionContext } from './ConnectionContext';
import { useFaderValue, useFaderContext } from './FaderContext';
import { clamp, FADER_MAX, faderToPercent, parseDecimal, percentToFader, sanitizeDecimalInput } from '@/utils/helpers';

const EMIT_INTERVAL_MS = 12; // Minimum time between two emits while dragging

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
  // Initialize context
  const { emit } = useConnectionContext();
  const { setFaderValue, getFaderValue } = useFaderContext();
  const faderValue = useFaderValue(sliderGroupId, id);

  const lastEmitRef = useRef(0);
  const trailingEmitRef = useRef<ReturnType<typeof setTimeout>>();
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Calculating the display value (0 to 100%) and update input value
  const scaledDisplayValue = faderToPercent(faderValue);
  const [inputValue, setInputValue] = useState<string>(Math.round(scaledDisplayValue) + '%');

  // Update input value when display value changes
  useEffect(() => {
    const finalDisplayValue = isFocused ? scaledDisplayValue.toFixed(1) : Math.round(scaledDisplayValue) + '%';
    setInputValue(finalDisplayValue);
  }, [scaledDisplayValue, isFocused]);

  // Emit fader value to the server
  const emitValue = useCallback(
    (value: number) => {
      if (sliderGroupId === 0 && id > 0) return; // Skip if a control fader
      emit('fader_value', { deviceId: sliderGroupId, value, channelId: id });
    },
    [emit, sliderGroupId, id]
  );

  // Cancel a pending emit when the fader unmounts
  useEffect(() => () => clearTimeout(trailingEmitRef.current), []);

  // Update the fader value on slider change, but send only at certain time intervals.
  // The last value is always sent (trailing emit), so the server ends up with the final position.
  const handleSliderChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const newValue = clamp(parseInt(event.target.value, 10), 0, FADER_MAX);
      setFaderValue(sliderGroupId, id, newValue);

      clearTimeout(trailingEmitRef.current);
      const sendNow = () => {
        lastEmitRef.current = Date.now();
        emitValue(newValue);
      };
      const elapsed = Date.now() - lastEmitRef.current;
      if (elapsed >= EMIT_INTERVAL_MS) {
        sendNow();
      } else {
        trailingEmitRef.current = setTimeout(sendNow, EMIT_INTERVAL_MS - elapsed);
      }
    },
    [sliderGroupId, id, emitValue, setFaderValue]
  );

  // Check if the input value is a number
  const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value.length <= 5) {
      setInputValue(sanitizeDecimalInput(value));
    }
  }, []);

  // Check if the input is valid and set the fader value
  const handleInputConfirm = useCallback(() => {
    const numericValue = parseDecimal(inputValue);
    if (!isNaN(numericValue)) {
      const scaledValue = percentToFader(numericValue);
      setFaderValue(sliderGroupId, id, scaledValue);
      emitValue(scaledValue);
      setInputValue(Math.round(clamp(numericValue, 0, 100)) + '%');
    } else {
      setInputValue(Math.round(scaledDisplayValue) + '%'); // Reset value if input is NaN
    }
    setIsFocused(false);
  }, [inputValue, scaledDisplayValue, sliderGroupId, id, emitValue, setFaderValue]);

  // Confirm with ENTER
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur(); // Remove focus from the input
    }
  }, []);

  // Scroll wheel and arrow keys support, only registered for the hovered fader
  useEffect(() => {
    if (!isHovered) return;

    // Read the current value from the store, several wheel events can arrive before the next render
    const updateFaderValue = (delta: number) => {
      const newValue = clamp(getFaderValue(sliderGroupId, id) + delta, 0, FADER_MAX);
      setFaderValue(sliderGroupId, id, newValue);
      emitValue(newValue);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.ctrlKey ? 10 : 1; // If CTRL is pressed, increase/decrease by 10, otherwise by 1
      updateFaderValue(-Math.sign(event.deltaY) * step);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
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
  }, [isHovered, sliderGroupId, id, emitValue, getFaderValue, setFaderValue]);

  // On value input focus
  const handleFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Delay to the next tick
    setTimeout(() => {
      event.target.select(); // Select the input text
    }, 50);
  }, []);

  // Background color of the lower half of the fader
  const backgroundColor = color || 'var(--mainColor)';
  const gradientStyle = {
    background: `linear-gradient(to right, ${backgroundColor} 0%, ${backgroundColor} ${scaledDisplayValue}%, rgba(40, 40, 40, 0.7) ${scaledDisplayValue}%, rgba(40, 40, 40, 0.7) 100%)`,
  };

  const label = number !== undefined ? `${number} ${name ?? ''}`.trim() : name;

  return (
    <div
      className={`fader ${height ? 'faderMaster' : ''} ${number ? 'numberAlign' : ''} ${className || ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--sliderHeight': `${height}px` } as React.CSSProperties}
    >
      {number !== undefined && <h2 className='faderText'>{number}</h2>}
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
          aria-label={label}
          aria-valuetext={`${Math.round(scaledDisplayValue)}%`}
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
        aria-label={label}
        inputMode='decimal'
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
