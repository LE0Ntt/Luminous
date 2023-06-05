import React, { useState, useContext } from 'react'
import { ipcRenderer } from 'electron';
import { TranslationContext } from './TranslationContext';
import './Titlebar.css';

function Titlebar() {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const { t } = useContext(TranslationContext);

  const toggleFullScreen = async () => {
    //console.log('Sending toggle-full-screen event'); // DEBUG
    const response = await ipcRenderer.invoke('toggle-full-screen');
    setIsFullScreen(!isFullScreen);
    //console.log(response); // DEBUG
  }

  const handleClose = () => {
    window.close();
  };

  const handleMinimize = () => {
    ipcRenderer.send('minimize');
  };

  return (
    <div className='titlebarComp'>
        <nav>
          <ul>
            <li><p className='mr-2'>Luminous</p></li>{/* mr-2 ist Tailwind, muss noch geändert werden :) */}
            <li><a href="#">⚙️</a>
              <ul>
                <li><a href="#">{t("language")}</a></li>
                <li><a href="#">{t("editLights")}</a></li>
                <li><a href="#">{t("small")}</a></li>
                <li>
                <button onClick={toggleFullScreen} className='flex'>
                <div>{isFullScreen ? t("exitFullscreen") : t("fullscreen")}</div>
                <div className='align-right'>F11</div>
                </button>
                </li>
                <li><a href="#">{t("documentation")}</a></li>
                <li><a href="#">{t("about")}</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        <div className='buttonContainer'>
          <button className="titlebar-button minimize" onClick={handleMinimize}>
            <div className="min"></div>
          </button>
          <button className="titlebar-button close" onClick={handleClose}>
            <div className="xFrame">
              <div className="x">
                <div className="x xi"></div>
              </div>
            </div>
          </button>
        </div>
    </div>
  )
}

export default Titlebar