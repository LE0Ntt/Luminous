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
 * @file Titlebar.tsx
 */
import React, { useEffect, useRef, useState, useContext } from 'react'
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';
import '../index.css';
import Settings from './Settings';
import DropDown from "./DropDown";
import LightSettings from './LightSettings';
import Help from './Help';
import About from './About';

enum Dialog {
  None,
  Settings,
  LightSettings,
  Help,
  About,
}

function TitleBar() {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const { t } = useContext(TranslationContext);
  const dropDownRef = useRef<HTMLButtonElement | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(Dialog.None);

  // Effect for platform detection
  useEffect(() => {
    (async () => {
      const platform = await (window as any).electronAPI.getPlatform();
      setIsMac(platform === 'darwin');
    })();
  }, []);

  const toggleFullScreen = async () => {
    (window as any).electronAPI.send('toggle-full-screen');
  };

  const handleClose = () => {
    window.close();
  };

  const handleMinimize = () => {
    (window as any).electronAPI.send('minimize');
  };

  const settings = [t("dd_settings"), t("dd_lights"), t("dd_help"), t("dd_about"), t("dd_fullscreen")];

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
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropDown]);

  const toggleDropDown = () => {
    setShowDropDown(!showDropDown);
  };

  // The selected setting
  const settingActions = {
    [settings[0]]: () => setCurrentDialog(Dialog.Settings),
    [settings[1]]: () => setCurrentDialog(Dialog.LightSettings),
    [settings[2]]: () => setCurrentDialog(Dialog.Help),
    [settings[3]]: () => setCurrentDialog(Dialog.About),
    [settings[4]]: toggleFullScreen
  };

  const handleSettingSelection = (setting: string) => {
    if (settingActions[setting]) settingActions[setting]();
  };

  return (
    <div className='titlebarComp'>
      <nav>
        <ul>
          <li>
            <div className={isMac ? 'hiddenlogo' : 'logo'}></div>
          </li>
          <li>
            <button
              className={showDropDown ? "active settingsButton" : "settingsButton" }
              onClick={(): void => toggleDropDown()}
              ref={dropDownRef}
            >
              <a href="#">⚙️</a>
            {showDropDown && (
              <DropDown
                settings={settings}
                settingSelection={handleSettingSelection}
              />
            )}
          </button>
          </li>
        </ul>
      </nav>
      <div className='buttonContainer'>
        <button className={isMac ? 'hide' : 'titlebar-button minimize'} onClick={handleMinimize}>
          <div className="min"></div>
        </button>
        <button className={isMac ? 'hide' : 'titlebar-button close'} onClick={handleClose}>
          <div className="x">
            <div className="x xi"></div>
          </div>
        </button>
      </div>
      {currentDialog === Dialog.Settings && <Settings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.LightSettings && <LightSettings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.Help && <Help onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.About && <About onClose={() => setCurrentDialog(Dialog.None)} />}
    </div>
  );
}

export default TitleBar;
