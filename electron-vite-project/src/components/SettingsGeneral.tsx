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
 * @file Settings_General.tsx
 */
import { useContext, useEffect, useState } from 'react';
import './Settings.css';
import Toggle from './Toggle';
import { TranslationContext } from './TranslationContext';
import IconLanguage from '@/assets/IconLanguage';
import IconFlip from '@/assets/IconFlip';
import IconDesign from '@/assets/IconDesign';

const Setting1: React.FC = () => {
  const { t, language, setLanguage } = useContext(TranslationContext);
  const [defaultDesign, setDefaultDesign] = useState(localStorage.getItem('defaultDesign') !== 'false');

  const handleOrderChange = () => {
    const newSetting = localStorage.getItem('reverseOrder') !== 'true';
    localStorage.setItem('reverseOrder', String(newSetting));
    window.dispatchEvent(new CustomEvent<boolean>('reverseOrder', { detail: newSetting }));
  };

  const handleShowChange = () => {
    const newSetting = localStorage.getItem('showPage') !== 'true';
    localStorage.setItem('showPage', String(newSetting));
    window.dispatchEvent(new CustomEvent<boolean>('showPage', { detail: newSetting }));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as 'en' | 'de');
  };

  // Toggle design
  useEffect(() => {
    if (defaultDesign) document.body.classList.remove('defaultB');
    else document.body.classList.add('defaultB');
    localStorage.setItem('defaultDesign', `${defaultDesign}`);
    window.dispatchEvent(new CustomEvent<boolean>('designChange', { detail: defaultDesign }));
  }, [defaultDesign]);

  return (
    <div className='SettingsOption'>
      <div className='SettingsTitle'>
        <span>{t('set_general')}</span>
      </div>
      <hr style={{ marginTop: '45px' }} />
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconLanguage
            color={'var(--primary)'}
            size='20px'
          />
          <span className='relative top-[-6px]'>{t('set_language')}</span>
        </div>
        <select
          className='SettingsLanguageSelection textBox'
          value={language}
          onChange={handleLanguageChange}
        >
          <option value='en'>{t('English 🇬🇧')}</option>
          <option value='de'>{t('Deutsch 🇩🇪')}</option>
        </select>
      </div>
      <hr />
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconFlip
            color={'var(--primary)'}
            size='20px'
          />
          <span className='relative top-[-6px]'>{t('cl_righthand')}</span>
        </div>
        <div className='flex items-center gap-4'>
          <Toggle
            onClick={handleOrderChange}
            enabled={localStorage.getItem('reverseOrder') === 'true'}
          />
        </div>
      </div>
      <hr />
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconDesign color={'var(--primary)'} />
          <span className='relative top-[-6px]'>{t('set_design')}</span>
        </div>
        <div className='items-center designContainer'>
          <div
            className='defaultDesign'
            onClick={() => setDefaultDesign(!defaultDesign)}
            style={{ pointerEvents: defaultDesign ? 'none' : 'auto' }}
          >
            <div className='redDiv'></div>
            <div className='blueDiv'></div>
            <div className='purpleDiv'></div>
            <div className={`designBlur ${defaultDesign ? 'activeDesign' : ''}`}></div>
            <span className='designDefaultSpan'>(Default)</span>
            <div className='designWindow defaultWindow '>
              <span className='designSpan'>Glassmorphism</span>
            </div>
          </div>
          <div
            className={`newDesign ${document.body.className.includes('dark') ? 'defaultB dark' : 'defaultB'} ${defaultDesign ? '' : 'activeDesign'} `}
            onClick={() => setDefaultDesign(!defaultDesign)}
          >
            <div className='designWindow window'>
              <span className='designSpan'>Neumorphism</span>
            </div>
          </div>
        </div>
      </div>
      {/* Show page (in development) 
      <hr />
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconFlip
            color={'var(--primary)'}
            size='20px'
          />
          <span className='relative top-[-6px]'>Show-Seite anzeigen (in Entwicklung)</span>
        </div>
        <div className='flex items-center gap-4'>
          Show dev page
          <Toggle
            onClick={handleShowChange}
            enabled={localStorage.getItem('showPage') === 'true'}
          />
        </div>
      </div>
      */}
    </div>
  );
};

export default Setting1;
