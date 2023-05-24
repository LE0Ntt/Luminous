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
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 -960 960 960" width="30"><path d="M350-274h178q14.45 0 24.225-9.775Q562-293.55 562-308v-54l60 31q8 4 15-.435T644-344v-103q0-8.13-7-12.565-7-4.435-15-.435l-60 31v-54q0-14.45-9.775-24.225Q542.45-517 528-517H350q-14.025 0-23.513 9.775Q317-497.45 317-483v175q0 14.45 9.487 24.225Q335.975-274 350-274Zm-190 94v-390q0-14.25 6.375-27T184-618l260-195q15.68-12 35.84-12Q500-825 516-813l260 195q11.25 8.25 17.625 21T800-570v390q0 24.75-17.625 42.375T740-120H220q-24.75 0-42.375-17.625T160-180Zm60 0h520v-394L480-763 220-574v394Zm260-292Z"/></svg>
                {t("studio")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Control" className={location.pathname === '/Control' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='rotateHeaderIcon' xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 96 960 960" width="30"><path d="M150 854q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 794h187q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T337 854H150Zm0-496q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 298h353q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T503 358H150Zm306.825 578Q444 936 435.5 927.375T427 906V741q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T487 741v53h323q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 854H487v52q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Zm-120-248Q324 688 315.5 679.375T307 658v-52H150q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T150 546h157v-54q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T367 492v166q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625ZM457 606q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T457 546h353q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 606H457Zm165.825-165Q610 441 601.5 432.375T593 411V246q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T653 246v52h157q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T810 358H653v53q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Z"/></svg>
                {t("control")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Scenes" className={location.pathname === '/Scenes' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 -960 960 960" width="30"><path d="M420-167 203-75q-30 13-56.5-5.5T120-131v-609q0-24 18-42t42-18h480q24 0 42.5 18t18.5 42v610q0 32.489-26.5 50.244Q668-62 638-75l-218-92Zm0-67 240 103v-609H180v609l240-103Zm360 104v-730H233v-60h547q24 0 42 18t18 42v730h-60ZM420-740H180h480-240Z"/></svg>
                {t("scenes")}
              </div>
              </Link>
            </li>
            <li>
              <Link to="/Show" className={location.pathname === '/Show' ? 'is-active' : ''}>
              <div className='headerButton'>
                <svg className='headerIcon' xmlns="http://www.w3.org/2000/svg" height="30" viewBox="0 -960 960 960" width="30"><path d="M629-467q7-4.5 7-12.75T629-493L410-634q-8-5-15.5-.5T387-621v282q0 9 7.5 13.5t15.5-.5l219-141ZM180-120q-24 0-42-18t-18-42v-600q0-24 18-42t42-18h600q24 0 42 18t18 42v600q0 24-18 42t-42 18H180Zm0-60h600v-600H180v600Zm0-600v600-600Z"/></svg>
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