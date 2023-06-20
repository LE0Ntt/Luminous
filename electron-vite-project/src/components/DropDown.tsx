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

  /**
   * Handle passing the city name
   * back to the parent component
   *
   * @param setting  The selected city
   */
  const onClickHandler = (city: string): void => {
    settingSelection(city);
  };

  useEffect(() => {
    setShowDropDown(showDropDown);
  }, [showDropDown]);

  return (
    <>
      <div className={showDropDown ? 'dropdown' : 'dropdown active'}>
        {settings.map(
          (city: string, index: number): JSX.Element => {
            return (
              <p
                key={index}
                onClick={(): void => {
                  onClickHandler(city);
                }}
              >
                {city}
              </p>
            );
          }
        )}
      </div>
    </>
  );
};

export default DropDown;
