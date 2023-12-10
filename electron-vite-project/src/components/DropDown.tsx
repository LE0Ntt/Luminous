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
import React, { ReactElement } from 'react';
import './DropDown.css';

type DropDownProps = {
  settings: { text: string; icon: React.ElementType }[];
  settingSelection: (selectedSetting: { text: string; icon: React.ElementType }) => void;
  open: boolean;
};

const DropDown: React.FC<DropDownProps> = ({ settings, settingSelection, open }) => {
  return (
    <div className={`dropdown ${open ? '' : 'closed'}`}>
      {settings.map((setting, index) => (
        <p
          key={index}
          onClick={() => settingSelection(setting)}
          className='flex'
        >
          <setting.icon />
          <span className='left-1 relative'>{setting.text}</span>
        </p>
      ))}
    </div>
  );
};

export default DropDown;
