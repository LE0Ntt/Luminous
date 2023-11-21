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
 * @file DropDown.tsx
 */
import React from 'react';
import './DropDown.css';

type DropDownProps = {
  settings: string[];
  settingSelection: (selectedSetting: string) => void;
};

const DropDown: React.FC<DropDownProps> = ({ settings, settingSelection }) => {
  return (
    <div className='dropdown'>
      {settings.map((selectedSetting, index) => (
        <p
          key={index}
          onClick={() => settingSelection(selectedSetting)}
        >
          {selectedSetting}
        </p>
      ))}
    </div>
  );
};

export default DropDown;
