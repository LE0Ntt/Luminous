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
 * @file ColorPicker.tsx
 */
import React, { useEffect, useRef, useState } from 'react';
import iro from '@jaames/iro';

interface ColorPickerProps {
  pickerType: 'wheel' | 'kelvin';
  red: number;
  green: number;
  blue: number;
  onColorChange: (newRed: number, newGreen: number, newBlue: number) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ pickerType, red, green, blue, onColorChange }) => {
  const pickerRef = useRef(null);
  const [colorPicker, setColorPicker] = useState<any>(null);

  useEffect(() => {
    if (iro && pickerRef.current && !colorPicker) {
      let layout;

      switch (pickerType) {
        case 'kelvin':
          layout = [{ component: iro.ui.Slider, options: { sliderType: 'kelvin' } }];
          break;
        case 'wheel':
        default:
          layout = [{ component: iro.ui.Wheel, options: {} }];
      }

      const newColorPicker = iro.ColorPicker(pickerRef.current, {
        width: pickerType === 'kelvin' ? 431 : 320,
        color: `rgb(${red}, ${green}, ${blue})`,
        layout,
      });

      newColorPicker.on('color:change', (color: any) => {
        onColorChange(color.rgb.r, color.rgb.g, color.rgb.b);
      });

      setColorPicker(newColorPicker);
    }
  }, [pickerType, red, green, blue, colorPicker, onColorChange]);

  useEffect(() => {
    if (colorPicker) {
      colorPicker.color.set(`rgb(${red}, ${green}, ${blue})`);
    }
  }, [red, green, blue]);

  return <div ref={pickerRef}></div>;
};

export default ColorPicker;
