/**
 * Toggle.tsx
 * @author Leon Hölzel
 */
import './Toggle.css';

interface ToggleProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const Toggle = ({ onClick, disabled, className }: ToggleProps) => {
  return (
    <label className="toggle">
        <input type="checkbox"/>
        <span className="defaultToggle round"></span>
    </label>
  );
};

export default Toggle;

// noch nicht fertig