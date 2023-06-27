/**
 * Button.tsx
 * @author Leon Hölzel
 */
import React from 'react';
import './Button.css';

interface ButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

const Button = ({ onClick, disabled, className, children }: ButtonProps) => {
  return (
    <button
      className={`buttonDesign ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
