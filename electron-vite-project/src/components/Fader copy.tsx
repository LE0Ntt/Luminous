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
import { useState, ChangeEvent, useEffect, useRef, useCallback } from 'react';
import './Fader.css';
import { useConnectionContext } from './ConnectionContext';
import { useFaderContext } from './FaderContext';
import React from 'react';

interface SliderProps {
  id: number;
  sliderGroupId: number;
  name?: string;
  number?: number;
  height?: number;
  className?: string;
  color?: string;
}

const Fader: React.FC<SliderProps> = ({ id, sliderGroupId, name, number, height, className, color }) => {
  // Initialize context and state
  const { emit, on, off } = useConnectionContext();
  const { faderValues, setFaderValue } = useFaderContext();
  const [faderValuesLocal, setFaderValuesLocal] = useState<number>(faderValues[sliderGroupId][id]);
  const [timerRunning, setTimerRunning] = useState<boolean | null>(null);

  // Refs to keep track of fader values and if they need to be sent
  const cacheValueRef = useRef<number>(faderValuesLocal);
  const sendValueRef = useRef<number>(faderValuesLocal);

  // Emit fader value to the server
  const emitValue = (value: number) => {
    const currentTime = new Date();

    emit('fader_value', {
      deviceId: sliderGroupId,
      value: value,
      channelId: id,
      timestamp: currentTime.toISOString(),
    });
    sendValueRef.current = value;
  };

  // Always send the last value
  useEffect(() => {
    if (!timerRunning && cacheValueRef.current != null && cacheValueRef.current != sendValueRef.current) emit('fader_value', { deviceId: sliderGroupId, value: faderValuesLocal, channelId: id });
  }, [timerRunning]);

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('handleSliderChange is called');
    let newValue = Math.min(Math.max(parseInt(event.target.value, 10), 0), 255);
    setFaderValuesLocal(newValue);
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

  useEffect(() => {
    console.log('Fader Component re-rendered');
  }); // This will log on every re-render

  useEffect(() => {
    const eventListener = (data: { deviceId: string; channelId: string; value: number }) => {
      if (Number(data.deviceId) === sliderGroupId) {
        setFaderValuesLocal(data.value);
      }
      // sollte raukommentiert werden, weil das ein rerender auslöst? maybe
      //console.log(data.deviceId, data.channelId, data.value);
    };

    const eventName = `variable_update_${sliderGroupId}`;
    //const eventName = `variable_update`;
    on(eventName, eventListener);

    return () => {
      off(eventName, eventListener);
    };
  }, [on, off, setFaderValuesLocal, faderValuesLocal]);

  return (
    <div
      className={`fader ${height && 'faderMaster'} ${number && 'numberAlign'} ${className}`}
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
          value={faderValuesLocal}
          onChange={handleSliderChange}
          className='slider'
        />
      </div>
      {/*       <input
        type='text'
        value={faderValuesLocal}
        className='inputNum'
      /> */}
      <span
        title={name}
        className='faderName'
      >
        {name}
      </span>
    </div>
  );
};

export default React.memo(Fader);
