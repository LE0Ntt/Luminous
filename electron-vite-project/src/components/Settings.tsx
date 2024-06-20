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
import { useState, useContext, useCallback } from 'react';
import './Settings.css';
import Button from './Button';
import { TranslationContext } from './TranslationContext';
import AdminPassword from './AdminPassword';
import Setting1 from './SettingsGeneral';
import Setting2 from './SettingsAdmin';
import Setting3 from './SettingsStudioOverview';
import IconSettings from '@/assets/Icon_Settings';
import IconAdmin from '@/assets/Icon_Admin';

interface SettingsProps {
  onClose: () => void;
}

function Settings({ onClose }: SettingsProps) {
  const { t } = useContext(TranslationContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<string | null>('Setting1');

  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
    if (isConfirmed) {
      setSelectedSetting('Setting2');
      setIsAdmin(false);
    }
  }, []);

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />
      {isAdmin ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setIsAdmin(false)}
        />
      ) : (
        <>
          <div className='SettingsContainer'>
            <button
              className='buttonClose'
              onClick={onClose}
            >
              <div className='xClose'>
                <div className='xClose xiClose'></div>
              </div>
            </button>
            <div className='SettingsTitle'>
              <IconSettings />
              <span className='SettingsTitleText'>{t('set_title')}</span>
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
                  onClick={() => setIsAdmin(true)}
                >
                  <div className='settingsButtonContent'>
                    <IconAdmin color={selectedSetting === 'Setting2' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_admin')}</span>
                  </div>
                </Button>
                {/* not for 1.2.x - exclude for release (maybe)????*/}
                <Button
                  className={selectedSetting === 'Setting3' ? 'active' : ''}
                  onClick={() => setSelectedSetting('Setting3')}
                >
                  <div className='settingsButtonContent'>
                    <IconAdmin color={selectedSetting === 'Setting3' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                    <span>{t('set_studio')}</span>
                  </div>
                </Button>
              </div>
              <div className='SettingContent innerWindow'>
                <div className='settingsContentContainer'>
                  {selectedSetting === 'Setting1' ? (
                    <Setting1 />
                  ) : selectedSetting === 'Setting2' ? (
                    <Setting2 />
                  ) : selectedSetting === 'Setting3' ? (
                    <Setting3
                      studioRows={6}
                      studioColumns={4}
                    />
                  ) : selectedSetting === 'Setting4' ? (
                    <div className='SettingsOption'>not used</div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Settings;
