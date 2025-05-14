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

type DesignType = 'default' | 'defaultB' | 'defaultC';

const Setting1: React.FC = () => {
  const { t, language, setLanguage } = useContext(TranslationContext);
  const [activeDesign, setActiveDesign] = useState<DesignType>((localStorage.getItem('activeDesign') as DesignType) || 'default');

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

  // Toggle design based on the activeDesign state
  useEffect(() => {
    document.body.classList.remove('defaultB', 'defaultC');
    if (activeDesign === 'defaultB') {
      document.body.classList.add('defaultB');
    } else if (activeDesign === 'defaultC') {
      document.body.classList.add('defaultC');
    }
    localStorage.setItem('activeDesign', activeDesign);
    window.dispatchEvent(new CustomEvent<string>('designChange', { detail: activeDesign }));
  }, [activeDesign]);

  return (
    <div className='SettingsOption'>
      <div className='SettingsTitle SettingsTitleInner'>
        <span>{t('set_general')}</span>
      </div>
      <hr style={{ marginTop: '45px' }} />
      {/* Language Setting */}
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
      {/* Right-Hand Setting */}
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
      {/* Design Setting */}
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          <IconDesign color={'var(--primary)'} />
          <span className='relative top-[-6px]'>{t('set_design')}</span>
        </div>
        <div className='items-center designContainer'>
          {/* Default Design */}
          <div
            className={'defaultDesign'}
            onClick={() => setActiveDesign('default')}
          >
            <div className='redDiv'></div>
            <div className='blueDiv'></div>
            <div className='purpleDiv'></div>
            <div className={`designBlur ${activeDesign === 'default' ? 'activeDesign' : ''}`}></div>
            <span className='designDefaultSpan'>(Default)</span>
            <div className='designWindow defaultWindow '>
              <span className='designSpan'>Glassmorphism</span>
            </div>
          </div>
          {/* Design B (Neumorphism) */}
          <div
            className={`newDesign ${document.body.className.includes('dark') ? 'defaultB dark' : 'defaultB'} ${activeDesign === 'defaultB' ? 'activeDesign' : ''} `}
            onClick={() => setActiveDesign('defaultB')}
          >
            <div className='designWindow window'>
              <span className='designSpan'>Neumorphism</span>
            </div>
          </div>
          {/* Design C (Minimal) */}
          <div
            className={`newDesign defaultC ${document.body.className.includes('dark') ? 'dark' : ''} ${activeDesign === 'defaultC' ? 'activeDesign' : ''} `}
            onClick={() => setActiveDesign('defaultC')}
          >
            <div className='designWindow window'>
              <span className='designSpan'>Minimal</span>
            </div>
          </div>
        </div>
      </div>
      {/* Show page (in development) */}
      {/*
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
