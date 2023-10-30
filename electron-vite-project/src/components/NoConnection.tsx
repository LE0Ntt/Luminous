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
 * @file NoConnection.tsx
 */
import { useContext, useEffect, useState } from 'react'
import { TranslationContext } from './TranslationContext';
import './NoConnection.css';

function NoConnection() {
  const { t } = useContext(TranslationContext);
  const [showNoConnection, setShowNoConnection] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setShowNoConnection(prev => !prev);
    }, 10000);
  
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="BigViewContainer noConnectionContent">
      <div className={`iconNoConnection ${showNoConnection ? 'show' : ''}`}></div>
      <p className={`noConnection ${showNoConnection ? 'show' : ''}`}>{t("noConnection")}</p>
      <span className={`loader ${!showNoConnection ? 'show' : ''}`}></span>
      <p className={`retryConnection ${!showNoConnection ? 'show' : ''}`}>{t("retryConnection")}</p>
      <p className='restartServer'>{t("restartServer")}</p>
    </div>
  );
}

export default NoConnection;