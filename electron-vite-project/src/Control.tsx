import React, {  useRef, useContext, useEffect, useState } from "react";
import { TranslationContext } from "./components/TranslationContext";
import './App.css';
import './Control.css';
import Fader from './components/Fader';

function Control() {
  const { t, language, setLanguage } = useContext(TranslationContext);

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as "en" | "de");
  };

  const [height, setHeight] = useState(189); // Startwert
  const pathFill   = `M10 17A10 10 0 0120 7h1820a10 10 0 0110 10v890a10 10 0 01-10 10H424a10 10 0 01-10-10V${height}a10 10 0 00-10-10H20a10 10 0 01-10-10V17z`;
  const pathStroke = `M1849.5 17v890a9.5 9.5 0 01-9.5 9.5H424a9.5 9.5 0 01-9.5-9.5V${height}c0-5.8-4.7-10.5-10.5-10.5H20a9.5 9.5 0 01-9.5-9.5V17A9.5 9.5 0 0120 7.5h1820a9.5 9.5 0 019.5 9.5z`;

  return (
    <div>
      <div className="devices window">
        <h1>{t("greeting")}</h1>
        <select value={language} onChange={handleLanguageChange}>
          <option value="en">{t("english")}</option>
          <option value="de">{t("german")}</option>
        </select>
      </div>

      <svg className="controlMain" width="1860" height="930" viewBox="0 0 1860 930" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g filter="url(#filter0_b_873_8277)">
          <g filter="url(#filter1_d_873_8277)" shape-rendering="geometricPrecision">
            <path d={pathFill} fill="#F6F6F6" fill-opacity=".6"/>
            <path d={pathStroke} stroke="#fff"/>
          </g>
        </g>
        <defs>
          <filter id="filter0_b_873_8277" x="-90" y="-93" width="2040" height="1110" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feGaussianBlur in="BackgroundImageFix" stdDeviation="50"/>
            <feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_873_8277"/>
            <feBlend in="SourceGraphic" in2="effect1_backgroundBlur_873_8277" result="shape"/>
          </filter>
          <filter id="filter1_d_873_8277" x="0" y="0" width="1860" height="930" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix"/>
            <feColorMatrix in="SourceAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
            <feOffset dy="3"/>
            <feGaussianBlur stdDeviation="5"/>
            <feComposite in2="hardAlpha" operator="out"/>
            <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"/>
            <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_873_8277"/>
            <feBlend in="SourceGraphic" in2="effect1_dropShadow_873_8277" result="shape"/>
          </filter>
        </defs>
      </svg>
    </div>
  );
}


export default Control;