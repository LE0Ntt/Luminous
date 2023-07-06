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
 * @file Toggle.tsx
 */
import { useState } from 'react';
import './Toggle.css';

interface ToggleProps {
  onClick?: (checked: boolean) => void;
  enabled?: boolean;
  className?: string;
}

const Toggle = ({ onClick, enabled, className }: ToggleProps) => {
  const [checked, setChecked] = useState(enabled || false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);

    if (onClick) {
      onClick(isChecked);
    }
  };
  
  return (
    <label className="toggle">
        <input type="checkbox" checked={checked} onChange={handleChange} />
        <span className="defaultToggle round"></span>
    </label>
  );
};

export default Toggle;