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

function About({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) return null;

  const version: string = packageJson.version;

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={handleClose}
      />
      <div className='LightSettingsContainer'>
        <Button
          onClick={() => handleClose()}
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
            <span>Version {version}</span>
            <br />
            <span>Leon Hölzel, Darwin Pietas, Marvin Plate, Andree Tomek</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
