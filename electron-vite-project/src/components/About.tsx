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
import { useContext } from 'react';
import './About.css';
import Button from './Button';
import { TranslationContext } from './TranslationContext';
import packageJson from '../../package.json';

interface SettingsProps {
  onClose: () => void;
}

const authors = 'Leon Hölzel, Darwin Pietas, Marvin Plate, Andree Tomek';

function About({ onClose }: SettingsProps) {
  const { t } = useContext(TranslationContext);
  const version: string = packageJson.version;

  // Move the reflection of the logo to the mouse position
  const handleMouseMove = (event: MouseEvent) => {
    const logo = document.querySelector('.logoReflection') as HTMLElement;
    if (!logo) return;

    const logoRect = logo.getBoundingClientRect();
    const logoX = logoRect.left + logoRect.width / 2;
    const logoY = logoRect.top + logoRect.height / 2;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

    let angleDeg = (Math.atan2(mouseY - logoY, mouseX - logoX) * 180) / Math.PI;
    angleDeg += 135;

    logo.style.transform = `scale(0.31) rotate(${angleDeg}deg)`;
  };

  document.addEventListener('mousemove', handleMouseMove);

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
            <div className='logoReflection'></div>
            <small>
              <i>{t('catchphrase')}</i>
            </small>
            <br />
            <br />
            <p>
              Version {version} -{' '}
              <a
                href='https://github.com/LE0Ntt/Luminous/blob/main/CHANGELOG.md'
                target='_blank'
                style={{ textDecoration: 'underline', textUnderlineOffset: '2px' }}
              >
                {t('whats_new')}
              </a>
            </p>
            <p>{authors}</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default About;
