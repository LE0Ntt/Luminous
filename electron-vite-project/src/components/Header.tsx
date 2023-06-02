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
      const storedIsDark = localStorage.getItem('isDark');
      setIsDark(storedIsDark === 'true');
    }, []);
    
    useEffect(() => {
      document.body.classList.toggle('dark', isDark);
      localStorage.setItem('isDark', `${isDark}`);
      document.body.dispatchEvent(new Event('class-change'))
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
            <li><p className='mr-2'>Luminous</p></li>{/* mr-2 ist Tailwind, muss noch geändert werden :) */}
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
              <div className='headerButton'>
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M360-280h160q17 0 28.5-11.5T560-320v-40l51 27q10 5 19.5-1t9.5-17v-98q0-11-9.5-17t-19.5-1l-51 27v-40q0-17-11.5-28.5T520-520H360q-17 0-28.5 11.5T320-480v160q0 17 11.5 28.5T360-280Zm-200 80v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200Zm80 0h480v-360L480-740 240-560v360Zm240-270Z"/></svg>
                {t("studio")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Control" className={location.pathname === '/Control' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='rotateHeaderIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M160-200q-17 0-28.5-11.5T120-240q0-17 11.5-28.5T160-280h160q17 0 28.5 11.5T360-240q0 17-11.5 28.5T320-200H160Zm0-480q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h320q17 0 28.5 11.5T520-720q0 17-11.5 28.5T480-680H160Zm320 560q-17 0-28.5-11.5T440-160v-160q0-17 11.5-28.5T480-360q17 0 28.5 11.5T520-320v40h280q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H520v40q0 17-11.5 28.5T480-120ZM320-360q-17 0-28.5-11.5T280-400v-40H160q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h120v-40q0-17 11.5-28.5T320-600q17 0 28.5 11.5T360-560v160q0 17-11.5 28.5T320-360Zm160-80q-17 0-28.5-11.5T440-480q0-17 11.5-28.5T480-520h320q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H480Zm160-160q-17 0-28.5-11.5T600-640v-160q0-17 11.5-28.5T640-840q17 0 28.5 11.5T680-800v40h120q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H680v40q0 17-11.5 28.5T640-600Z"/></svg>
                {t("control")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Scenes" className={location.pathname === '/Scenes' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M400-160 232-88q-40 17-76-6.5T120-161v-519q0-33 23.5-56.5T200-760h400q33 0 56.5 23.5T680-680v519q0 43-36 66.5T568-88l-168-72Zm0-88 200 86v-518H200v518l200-86Zm360 88v-680H240v-80h520q33 0 56.5 23.5T840-840v680h-80ZM400-680H200h400-200Z"/></svg>
                {t("scenes")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Show" className={location.pathname === '/Show' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M634-463q9-6 9-17t-9-17L411-640q-10-7-20.5-1T380-623v286q0 12 10.5 18t20.5-1l223-143ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z"/></svg>
                {t("show")}
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
              <svg className='centerIcon' xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 -960 960 960" width="36"><path d="M480-120q-150 0-255-105T120-480q0-135 79.5-229T408-830q41-8 56 14t-1 60q-9 23-14 47t-5 49q0 90 63 153t153 63q25 0 48.5-4.5T754-461q43-16 64 1.5t11 59.5q-27 121-121 200.5T480-120Zm0-60q109 0 190-67.5T771-406q-25 11-53.667 16.5Q688.667-384 660-384q-114.689 0-195.345-80.655Q384-545.311 384-660q0-24 5-51.5t18-62.5q-98 27-162.5 109.5T180-480q0 125 87.5 212.5T480-180Zm-4-297Z"/></svg>
            </Button>
        </div>
    </div>
  )
}

export default Header