import React, { useEffect, useState } from 'react';
import './Settings.css';
import Toggle from './Toggle';

interface Setting1Props {
  t: (key: string) => string;
  language: string;
  handleLanguageChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Setting1: React.FC<Setting1Props> = ({ t, language, handleLanguageChange }) => {
  const handleToggleChange = () => {
    const newSetting = localStorage.getItem('reverseOrder') !== 'true';
    localStorage.setItem('reverseOrder', String(newSetting));
    window.dispatchEvent(new CustomEvent<boolean>('reverseOrder', { detail: newSetting }));
  };

  return (
    <div>
      <div className='SettingsOption'>
        <div className='Heading'>
          <span>{t('set_general')}</span>
        </div>
        <div className='flex gap-2'>
          <div className='LightSettingsSubTitle'>
            <span className='relative top-5'>{t('set_language')}</span>
          </div>
          <div className='SettingsTextBoxContainer SettingsLanguageContainer'>
            <select
              className='SettingsLanguageSelection'
              value={language}
              onChange={handleLanguageChange}
            >
              <option value='en'>{t('English 🇬🇧')}</option>
              <option value='de'>{t('German 🇩🇪')}</option>
            </select>
          </div>
        </div>
      </div>
      <div className='LightSettingsSubTitle'>
        <span>{t('appearance')}</span>
      </div>
      <div>
        <label>{t('cl_righthand')}</label>
        <Toggle
          onClick={handleToggleChange}
          enabled={localStorage.getItem('reverseOrder') === 'true'}
        />
      </div>
    </div>
  );
};

export default Setting1;
