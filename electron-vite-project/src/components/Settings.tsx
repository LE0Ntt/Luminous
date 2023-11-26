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
 * @file Settings.tsx
 */
import { useState, useContext, useEffect, useCallback } from 'react';
import './Settings.css';
import Button from './Button';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import AdminPassword from './AdminPassword';
import Setting1 from './Settings_General';
import Setting2 from './Settings_Admin';
import IconSettings from '@/assets/Icon_Settings';
import IconAdmin from '@/assets/Icon_Admin';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const [isOlaWindowOpen, setIsOlaWindowOpen] = useState(false);
  const newUrl = url.toString().slice(0, -5) + ':9090';
  const [selectedSetting, setSelectedSetting] = useState<string | null>('Setting1');

  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
    if (isConfirmed) {
      window.electronAPI.openExternal(newUrl);
      onClose();
    }
  }, []);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {isOlaWindowOpen ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setIsOlaWindowOpen(false)}
        />
      ) : (
        <>
          <div className='SettingsContainer'>
            <Button
              onClick={onClose}
              className='buttonClose'
            >
              <div className='removeIcon centerIcon'></div>
            </Button>
            <div className='SettingsTitle'>
              <span>{t('set_title')}</span>
            </div>
            <div className='SettingsContent'>
              <div className='settings'>
                <Button
                  className={selectedSetting === 'Setting1' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting1')}
                >
                  <div className='settingsButtonContent'>
                    <IconSettings color={selectedSetting === 'Setting1' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_general')}</span>
                  </div>
                </Button>
                <Button
                  className={selectedSetting === 'Setting2' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting2')}
                >
                  <div className='settingsButtonContent'>
                    <IconAdmin color={selectedSetting === 'Setting2' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_admin')}</span>
                  </div>
                </Button>
              </div>
              <div className='SettingContent innerWindow'>
                {selectedSetting === 'Setting1' ? (
                  <Setting1 />
                ) : selectedSetting === 'Setting2' ? (
                  <Setting2
                    url={url}
                    setIsOlaWindowOpen={setIsOlaWindowOpen}
                  />
                ) : selectedSetting === 'Setting3' ? (
                  <div className='SettingsOption'>not used</div>
                ) : selectedSetting === 'Setting4' ? (
                  <div className='SettingsOption'>not used</div>
                ) : null}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Settings;
