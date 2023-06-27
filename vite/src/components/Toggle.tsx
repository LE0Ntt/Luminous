/**
 * Toggle.tsx
 * @author Leon Hölzel
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