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
import { useContext, useEffect, useRef } from 'react';
import './About.css';
import { TranslationContext } from './TranslationContext';
import { version } from '../../package.json';
import CloseButton from './CloseButton';
import IconAbout from '@/assets/IconAbout';

interface SettingsProps {
  onClose: () => void;
}

const authors = 'Leon Hölzel, Darwin Pietas, Marvin Plate, Andree Tomek';

function About({ onClose }: SettingsProps) {
  const { t } = useContext(TranslationContext);
  const reflectionRef = useRef<HTMLDivElement>(null);

  // Move the reflection of the logo to the mouse position
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const logo = reflectionRef.current;
      if (!logo) return;

      const logoRect = logo.getBoundingClientRect();
      const logoX = logoRect.left + logoRect.width / 2;
      const logoY = logoRect.top + logoRect.height / 2;

      let angleDeg = (Math.atan2(event.clientY - logoY, event.clientX - logoX) * 180) / Math.PI;
      angleDeg += 135;

      logo.style.transform = `scale(0.31) rotate(${angleDeg}deg)`;
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      <div
        className='LightSettingsContainer'
        role='dialog'
        aria-modal='true'
        aria-label={t('dd_about')}
      >
        <CloseButton onClose={onClose} />
        <div className='SettingsTitle'>
          <IconAbout />
          <span className='SettingsTitleText'>{t('dd_about')}</span>
        </div>
        <div className='AboutContainer'>
          <div className='AboutTextBoxContainer'>
            <div className='logoBig'></div>
            <div
              className='logoReflection'
              ref={reflectionRef}
            ></div>
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
                rel='noopener noreferrer'
                style={{
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  textDecorationThickness: '1px',
                }}
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
