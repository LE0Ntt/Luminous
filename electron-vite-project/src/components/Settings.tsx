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
import IconSettings from '@/assets/IconSettings';
import IconAdmin from '@/assets/IconAdmin';
import { useConnectionContext } from './ConnectionContext';

interface SettingsProps {
  onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose }) => {
  const { t } = useContext(TranslationContext);
  const { connected } = useConnectionContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<string>('Setting1');
  const [initialConnected, setInitialConnected] = useState<boolean | null>(null);

  // Confirm the password to access the admin settings
  const handleAdminPasswordConfirm = useCallback((isConfirmed: boolean) => {
    if (isConfirmed) {
      setSelectedSetting('Setting2');
      setIsAdmin(false);
    }
  }, []);

  // Check that the client is connected so that the password can be confirmed or only the IP address can be set
  const handleAdminSettings = () => {
    if (connected) {
      setIsAdmin(true);
    } else {
      setSelectedSetting('Setting2');
    }
    setInitialConnected(connected);
  };

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
                onClick={handleAdminSettings}
              >
                <div className='settingsButtonContent'>
                  <IconAdmin color={selectedSetting === 'Setting2' ? 'var(--primarySwitched)' : 'var(--primary)'} />
                  <span>{t('set_admin')}</span>
                </div>
              </Button>
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
                ) : selectedSetting === 'Setting2' && initialConnected !== null ? (
                  <Setting2 connected={initialConnected} />
                ) : selectedSetting === 'Setting3' ? (
                  <Setting3
                    studioRows={5}
                    studioColumns={4}
                  />
                ) : selectedSetting === 'Setting4' ? (
                  <div className='SettingsOption'>not used</div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
