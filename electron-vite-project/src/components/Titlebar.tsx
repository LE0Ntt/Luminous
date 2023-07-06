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
import React, { useState, useContext, useEffect, useRef } from 'react'
import { ipcRenderer } from 'electron';
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';
import '../index.css';
import Settings from './Settings';
import DropDown from "./DropDown";
import LightSettings from './LightSettings';
import Help from './Help';
import About from './About';

function TitleBar() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [lightSettingsOpen, setLightSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const { t } = useContext(TranslationContext);
  const dropDownRef = useRef<HTMLButtonElement | null>(null);

  const toggleFullScreen = async () => {
    ipcRenderer.send('toggle-full-screen');
  };

  const handleClose = () => {
    window.close();
  };

  const handleMinimize = () => {
    ipcRenderer.send('minimize');
  };

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
    if(setting === settings()[2]) {
      openHelp();
    }
    if(setting === settings()[3]) {
      openAbout();
    }
    if(setting === settings()[4]) {
      toggleFullScreen();
    }
  };

  const openSettings = () => {
    setSettingsOpen(true);
  };

  const closeSettings = () => {
    setSettingsOpen(false);
  };

  const openLightSettings = () => {
    setLightSettingsOpen(true);
  };

  const closeLightSettings = () => {
    setLightSettingsOpen(false);
  };

  const openHelp = () => {
    setHelpOpen(true);
  };
  const closeHelp = () => {
    setHelpOpen(false);
  };

  const openAbout = () => { 
    setAboutOpen(true);
  };
  const closeAbout = () => {
    setAboutOpen(false);
  };

  // MacOS Titlebar Settings                ---  nicht benötig, da es nie auf mac laufen soll
  const isMac = process.platform === 'darwin';

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
      {settingsOpen && <Settings onClose={closeSettings} />}
      {lightSettingsOpen && <LightSettings onClose={closeLightSettings} />}
      {helpOpen && <Help onClose={closeHelp} />}
      {aboutOpen && <About onClose={closeAbout} />}
    </div>
  );
}

export default TitleBar;
