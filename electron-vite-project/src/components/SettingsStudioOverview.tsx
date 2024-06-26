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
 * @file SettingsStudioOverview.tsx
 */
import React, { useContext, useEffect, useState } from 'react';
import './Settings.css';
import { TranslationContext } from './TranslationContext';
import Button from './Button';
import IconKey from '@/assets/IconKey';
import { useConnectionContext } from './ConnectionContext';

interface Setting3Props {
  studioRows: number;
  studioColumns: number;
}

const Setting3: React.FC<Setting3Props> = ({ studioRows, studioColumns }) => {
  const { t } = useContext(TranslationContext);

  const [inputStudioRows, setInputStudioRows] = useState<number>(studioRows);
  const [inputStudioColumns, setInputStudioColumns] = useState<number>(studioColumns);

  // Next input on ENTER
  const handleEnterNext = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const form = event.currentTarget.form;
      if (form) {
        const inputs = Array.from(form.elements) as HTMLInputElement[];
        const index = inputs.indexOf(event.currentTarget);
        const nextInput = inputs[index + 1];
        if (nextInput) {
          nextInput.focus();
          event.preventDefault();
        }
      }
    }
  };

  const handleInputStudioRows = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputStudioRows(Number(e.target.value));
  };

  const handleInputStudioColumns = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputStudioColumns(Number(e.target.value));
  };

  return (
    <div className='SettingsOption'>
      <div className='SettingsTitle SettingsTitleInner'>
        <span>{t('set_studio')}</span>
      </div>
      <hr style={{ marginTop: '45px' }} />
      <div className='SettingContainer'>
        <div className='SettingsSubTitle'>
          {/* spaceholder */}
          <IconKey
            color={'var(--primary)'}
            size='20px'
          />
          <span className='relative top-[-6px]'>{t('change_studio_layout')}</span>
          Rows:
          <select
            className='LightSettingsTextBoxSmall textBox'
            value={inputStudioRows}
            onChange={handleInputStudioRows}
          >
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </select>
          Columns:
          <select
            className='LightSettingsTextBoxSmall textBox'
            value={inputStudioColumns}
            onChange={handleInputStudioColumns}
          >
            <option value='1'>1</option>
            <option value='2'>2</option>
            <option value='3'>3</option>
            <option value='4'>4</option>
            <option value='5'>5</option>
            <option value='6'>6</option>
            <option value='7'>7</option>
            <option value='8'>8</option>
            <option value='9'>9</option>
            <option value='10'>10</option>
          </select>
        </div>
      </div>
      <hr />
    </div>
  );
};

export default Setting3;
