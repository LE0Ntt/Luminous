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
 * @file Button.tsx
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
