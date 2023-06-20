import React, { useState, useContext } from 'react'
import { ipcRenderer } from 'electron';
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';
import '../index.css';
import Button from './Button';
import Settings from './Settings';
import DropDown from "./DropDown";

function TitleBar() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const { t } = useContext(TranslationContext);

  const toggleFullScreen = async () => {
    const response = await ipcRenderer.invoke('toggle-full-screen');
    setIsFullScreen(!isFullScreen);
  };

  const handleClose = () => {
    window.close();
  };

  const handleMinimize = () => {
    ipcRenderer.send('minimize');
  };

  const [showDropDown, setShowDropDown] = useState<boolean>(false);

  const settings = () => {
    return [t("dd_settings"), t("dd_lights"), t("dd_help"), t("dd_about"), t("dd_fullscreen")];
  };

  const toggleDropDown = () => {
    setShowDropDown(!showDropDown);
  };
  /**
   * Hide the drop down menu if click occurs
   * outside of the drop-down element.
   *
   * @param event  The mouse event
   */
  const dismissHandler = (event: React.FocusEvent<HTMLButtonElement>): void => {
    const delayedCodeExecution = () => {
      setShowDropDown(false);
    };
    setTimeout(delayedCodeExecution, 100);
  };
  /*
  * @param setting  The selected setting
  */
  const settingSelection = (setting: string): void => {
    if(setting === settings()[0]) {
      openSettings();
    }
    if(setting === settings()[4]) {
      toggleFullScreen();
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

  /**
   * MacOS Titlebar Settings
   */
  const isMac = process.platform === 'darwin';
  //const isMac = false;

  return (
    <div className='titlebarComp'>
      <nav>
        <ul>
          <li>
            <p className={isMac ? 'mr-2 hide' : 'mr-2'}>Luminous</p> {/* mr-2 ist Tailwind, muss noch geändert werden :) */}
          </li>
          <li>
            <button
              className={showDropDown ? "active" : undefined  }
              onClick={(): void => toggleDropDown()}
              onBlur={(e: React.FocusEvent<HTMLButtonElement>): void =>
                dismissHandler(e)
              }
            >
              <a href="#">⚙️</a> {/* {t("Settings")} eigentlich nur das Icon */}
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
    </div>
  );
};

export default TitleBar;
