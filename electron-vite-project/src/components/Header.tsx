/**
 * Header.tsx
 * @author Leon Hölzel
 */
import React, { useState, useEffect, useContext } from 'react'
import "./Header.modules.css";
import "../index.css";
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';
import { TranslationContext } from './TranslationContext';
import { ipcRenderer } from 'electron';

function Header() {
    let location = useLocation();

    const { t } = useContext(TranslationContext);
    const [isDark, setIsDark] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    useEffect(() => {
      document.body.classList.toggle('dark', isDark);
    });

    useEffect(() => {
      localStorage.setItem('isDark', `${isDark}`);
    }, [isDark]);

    const toggleTheme = () => {
      setIsDark(!isDark);
    };

    const toggleFullScreen = async () => {
      //console.log('Sending toggle-full-screen event'); // DEBUG
      const response = await ipcRenderer.invoke('toggle-full-screen');
      setIsFullScreen(!isFullScreen);
      //console.log(response); // DEBUG
    }
    

  return (
    <div className='header'>
        <nav>
          <ul>
            <li><a href="#">{t("settings")}</a>
              <ul>
                <li><a href="#">{t("language")}</a></li>
                <li><a href="#">{t("editLights")}</a></li>
              </ul>
            </li>
            <li><a href="#">{t("view")}</a>
              <ul>
                <li><a href="#">{t("small")}</a></li>
                <li>
                <button onClick={toggleFullScreen} className='flex'>
                <div>{isFullScreen ? t("exitFullscreen") : t("fullscreen")}</div>
                <div className='align-right'>F11</div>
                </button>
                </li>
              </ul>
            </li>
            <li><a href="#">{t("help")}</a>
              <ul>
                <li><a href="#">{t("documentation")}</a></li>
                <li><a href="#">{t("about")}</a></li>
              </ul>
            </li>
          </ul>
        </nav>
        <div className='containerHeader'>
          <ul className="unorderedList">
            <li>
            <Link to="/" className={location.pathname === '/' || location.pathname === '/Studio' ? 'is-active' : ''}>
                <div className='button'>
                    <div className='fill'></div>
                    <div className='buttonFont'>{t("studio")}</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Control" className={location.pathname === '/Control' ? 'is-active' : ''}>
              <div className='button'>
                    <div className='fill'></div>
                    <div className='buttonFont'>{t("control")}</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Scenes" className={location.pathname === '/Scenes' ? 'is-active' : ''}>
              <div className='button'>
                    <div className='fill'></div>
                    <div className='buttonFont'>{t("scenes")}</div>
                </div>
              </Link>
            </li>
            <li>
              <Link to="/Show" className={location.pathname === '/Show' ? 'is-active' : ''}>
              <div className='button'>
                    <div className='fill'></div>
                    <div className='buttonFont'>{t("show")}</div>
                </div>
              </Link>
            </li>
          </ul>
        </div>
        <div className='divTheme'>
            <Button 
            onClick={toggleTheme}
            className='buttonTheme'
            >
              <svg className='centerIcon' xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 -960 960 960" width="36"><path 
              d="M480-120q-150 0-255-105T120-480q0-135 79.5-229T408-830q41-8 56 14t-1 60q-9 23-14 47t-5 49q0 90 63 153t153 63q25 0 
              48.5-4.5T754-461q43-16 64 1.5t11 59.5q-27 121-121 200.5T480-120Zm0-60q109 0 190-67.5T771-406q-25 11-53.667 16.5Q688.667-384 
              660-384q-114.689 0-195.345-80.655Q384-545.311 384-660q0-24 5-51.5t18-62.5q-98 27-162.5 109.5T180-480q0 125 87.5 
              212.5T480-180Zm-4-297Z"/>
              </svg>
              </Button>
        </div>
    </div>
  )
}

export default Header