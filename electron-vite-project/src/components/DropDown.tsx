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
