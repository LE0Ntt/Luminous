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
import React, { useEffect, useState } from 'react';
import './DropDown.css';

type DropDownProps = {
  settings: string[];
  showDropDown: boolean;
  toggleDropDown: Function;
  settingSelection: Function;
};

const DropDown: React.FC<DropDownProps> = ({
  settings,
  settingSelection,
}: DropDownProps): JSX.Element => {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  const onClickHandler = (selectedSetting: string): void => {
    settingSelection(selectedSetting);
  };

  useEffect(() => {
    setShowDropDown(showDropDown);
  }, [showDropDown]);

  return (
    <div className={showDropDown ? 'dropdown' : 'dropdown active'}>
      {settings.map(
        (selectedSetting: string, index: number): JSX.Element => {
          return (
            <p
              key={index}
              onClick={(): void => {
                onClickHandler(selectedSetting);
              }}
            >
              {selectedSetting}
            </p>
          );
        }
      )}
    </div>
  );
}

export default DropDown;
