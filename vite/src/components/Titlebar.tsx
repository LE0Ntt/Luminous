import { useState, useContext, useEffect, useRef } from 'react'
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';
import '../index.css';
import Settings from './Settings';
import DropDown from "./DropDown";
import LightSettings from './LightSettings';

function TitleBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightSettingsOpen, setLightSettingsOpen] = useState(false);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const { t } = useContext(TranslationContext);
  const dropDownRef = useRef<HTMLButtonElement | null>(null);

  const settings = () => {
    return [t("dd_settings"), t("dd_lights"), t("dd_help"), t("dd_about"), t("dd_fullscreen")];
  };

  // Closes the drop down if the user clicks outside of it
  const handleClickOutside = (event: MouseEvent) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node) && event.target !== dropDownRef.current) {
      setShowDropDown(false);
    }
  };

  // Listens for clicks outside of the dropdown window
  useEffect(() => {
    if (showDropDown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropDown]);

  
  const toggleDropDown = () => {
    setShowDropDown(!showDropDown);
  };

  // The selected setting
  const settingSelection = (setting: string): void => {
    if(setting === settings()[0]) {
      openSettings();
    }
    if(setting === settings()[1]) {
      openLightSettings();
    }
  };

  const openSettings = () => {
    console.log('Settings opened!');
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    console.log('Settings closed!');
    setSettingsOpen(false);
  };

  const openLightSettings = () => {
    console.log('Light-Settings opened!');
    setLightSettingsOpen(true);
  };

  const closeLightSettings = () => {
    console.log('Light-Settings closed!');
    setLightSettingsOpen(false);
  };

  return (
    <div className='titlebarComp'>
      <nav>
        <ul>
          <li>
            <div className='logo'></div>
          </li>
          <li>
            <button
              className={showDropDown ? "active settingsButton" : "settingsButton" }
              onClick={(): void => toggleDropDown()}
              ref={dropDownRef}
            >
              <a href="#">⚙️</a> {/* {t("Settings")} */}
            {showDropDown && (
              <DropDown
                settings={settings()}
                showDropDown={false}
                toggleDropDown={(): void => toggleDropDown()}
                settingSelection={settingSelection}
              />
            )}
          </button>
          </li>
        </ul>
      </nav>
      {settingsOpen && <Settings onClose={closeSettings} />}
      {lightSettingsOpen && <LightSettings onClose={closeLightSettings} />}
    </div>
  );
};

export default TitleBar;
