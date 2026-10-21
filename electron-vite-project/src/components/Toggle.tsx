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
import React, { useEffect, useState } from 'react';
import './Toggle.css';

interface ToggleProps {
  onClick?: (checked: boolean) => void;
  enabled?: boolean;
  className?: string;
  label?: string; // Accessible name, the visible labels are usually next to the toggle
}

const Toggle: React.FC<ToggleProps> = ({ onClick = () => {}, enabled = false, className = '', label }) => {
  const [checked, setChecked] = useState(enabled);

  // Update checked state if enabled prop changes
  useEffect(() => {
    setChecked(enabled);
  }, [enabled]);

  // Handle change event
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    setChecked(isChecked);
    onClick(isChecked);
  };

  return (
    <label className={`toggle ${className}`}>
      <input
        type='checkbox'
        checked={checked}
        onChange={handleChange}
        aria-label={label}
      />
      <span className='defaultToggle round'></span>
    </label>
  );
};

export default Toggle;
