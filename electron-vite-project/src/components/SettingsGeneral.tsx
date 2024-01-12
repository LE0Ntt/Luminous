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
import { useContext } from 'react';
import './Settings.css';
import Toggle from './Toggle';
import { TranslationContext } from './TranslationContext';
import IconLanguage from '@/assets/IconLanguage';
import IconFlip from '@/assets/IconFlip';

const Setting1: React.FC = () => {
  const { t, language, setLanguage } = useContext(TranslationContext);

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
    </div>
  );
};

export default Setting1;
