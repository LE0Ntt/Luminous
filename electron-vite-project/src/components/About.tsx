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
 * @file About.tsx
 */
import { useState, useContext } from 'react';
import './Settings.css';
import Button from './Button';
import '../index.css';
import { TranslationContext } from './TranslationContext';
import packageJson from '../../package.json';

interface SettingsProps {
  onClose: () => void;
}

const authors = 'Leon Hölzel, Darwin Pietas, Marvin Plate, Andree Tomek';

function About({ onClose }: SettingsProps) {
  const { t } = useContext(TranslationContext);
  const version: string = packageJson.version;

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      <div className='LightSettingsContainer'>
        <Button
          onClick={onClose}
          className='buttonClose'
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='SettingsTitle'>
          <span>{t('dd_about')}</span>
        </div>
        <div className='AboutContainer'>
          <div className='AboutTextBoxContainer'>
            <div className='logoBig'></div>
            <small>
              <i>{t('catchphrase')}</i>
            </small>
            <br />
            <br />
            <p>Version {version}</p>
            <p>{authors}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
