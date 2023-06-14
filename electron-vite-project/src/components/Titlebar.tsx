import React, { useState, useContext } from 'react'
import { ipcRenderer } from 'electron';
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';
import '../index.css';
import Button from './Button';
import Settings from './Settings';

function TitleBar() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [settings, setSettings] = useState(false);
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

  const openSettings = () => {
    console.log('Settings opened!');
    setSettings(true);
  };

  const closeSettings = () => {
    console.log('Settings closed!');
    setSettings(false);
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
            <button className="dropdown-toggle" onClick={openSettings}>
              <a href="#">⚙️</a> {/* {t("Settings")} eigentlich nur das Icon */}
            </button>
            {settings && <Settings onClose={closeSettings} />}
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={openSettings}>
                  {t("Language")}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={openSettings}>
                  {t("Edit Lights")}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={openSettings}>
                  {t("Documentation")}
                </button>
              </li>
              <li>
                <button className="dropdown-item" onClick={toggleFullScreen}>
                  {isFullScreen ? t("exitFullscreen") : t("fullscreen")}
                </button>
              </li>
            </ul>
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
    </div>
  );
}

export default TitleBar