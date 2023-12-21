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
 * @file Titlebar.tsx
 */
import { useEffect, useRef, useState, useContext } from 'react';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import './Titlebar.css';
import Settings from './Settings';
import DropDown from './DropDown';
import LightSettings from './LightSettings';
import Help from './Help';
import About from './About';
import IconSettings from '@/assets/Icon_Settings';
import IconFullscreen from '@/assets/Icon_Fullscreen';
import IconHelp from '@/assets/Icon_Help';
import IconWindow from '@/assets/Icon_Window';
import IconLight from '@/assets/Icon_Light';
import IconAbout from '@/assets/Icon_About';
import RecoverDialog from './RecoverDialog';

enum Dialog {
  None,
  Settings,
  LightSettings,
  Help,
  About,
}

function TitleBar() {
  const [showDropDown, setShowDropDown] = useState<boolean>(false);
  const { t } = useContext(TranslationContext);
  const { connected, emit, on, off } = useConnectionContext();
  const dropDownRef = useRef<HTMLButtonElement | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [currentDialog, setCurrentDialog] = useState(Dialog.None);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayResetDialog, setDisplayResetDialog] = useState(false);

  // Effect for platform detection
  useEffect(() => {
    (async () => {
      const platform = await (window as any).electronAPI.getPlatform();
      setIsMac(platform === 'darwin');
    })();
  }, []);

  // Effect for reset / recover dialog detection
  useEffect(() => {
    on('recover_dialog', () => setDisplayResetDialog(true));

    return () => {
      off('recover_dialog', () => setDisplayResetDialog(false));
    };
  }, [on, off]);

  // Toggles the full screen mode
  useEffect(() => {
    const fetchFullScreenStatus = async () => {
      const fullScreenStatus = await (window as any).electronAPI.getFullScreen();
      setIsFullscreen(fullScreenStatus);
    };

    fetchFullScreenStatus();
  }, []);

  const toggleFullScreen = async () => {
    (window as any).electronAPI.send('toggle-full-screen');
    setIsFullscreen(!isFullscreen);
  };

  const handleMinimize = () => {
    (window as any).electronAPI.send('minimize');
  };

  const settings = [
    { icon: IconSettings, text: t('dd_settings') },
    { icon: IconLight, text: t('dd_lights') },
    { icon: IconHelp, text: t('dd_help') },
    { icon: IconAbout, text: t('dd_about') },
    { icon: isFullscreen ? IconWindow : IconFullscreen, text: isFullscreen ? t('dd_window') : t('dd_fullscreen') },
  ];

  // Closes the drop down if the user clicks outside of it
  const handleClickOutside = (event: MouseEvent) => {
    if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node) && event.target !== dropDownRef.current) {
      setShowDropDown(false);
    }
  };

  // Listens for clicks outside of the dropdown window
  useEffect(() => {
    if (showDropDown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDropDown]);

  // The selected setting
  const settingActions = {
    [settings[0].text]: () => setCurrentDialog(Dialog.Settings),
    [settings[1].text]: () => setCurrentDialog(Dialog.LightSettings),
    [settings[2].text]: () => setCurrentDialog(Dialog.Help),
    [settings[3].text]: () => setCurrentDialog(Dialog.About),
    [settings[4].text]: toggleFullScreen,
  };

  const handleSettingSelection = (selectedSetting: { text: string; icon: React.ElementType }) => {
    if (settingActions[selectedSetting.text]) {
      settingActions[selectedSetting.text]();
    }
  };

  // Timeout for the dropdown animation
  useEffect(() => {
    let timeout: string | number | NodeJS.Timeout | undefined;
    if (!showDropDown && isDropdownVisible) {
      timeout = setTimeout(() => {
        setIsDropdownVisible(false);
      }, 150);
    } else if (showDropDown && !isDropdownVisible) {
      setIsDropdownVisible(true);
    }
    return () => clearTimeout(timeout);
  }, [showDropDown, isDropdownVisible]);

  const closeWindow = () => {
    // delay between sending the turn_off event and closing the window
    emit('turn_off');
    setTimeout(() => {
      window.close();
    }, 100);
  };

  return (
    <div className={`titlebarComp ${showDropDown && 'active'}`}>
      <nav>
        <ul>
          <li>
            <div className={isMac ? 'hiddenlogo' : 'logo'}></div>
          </li>
          <li>
            <button
              onClick={() => setShowDropDown(!showDropDown)}
              ref={dropDownRef}
            >
              <div className={`settingsButton ${showDropDown && 'active'}`}>
                <IconSettings
                  size='20px'
                  color='var(--secondary)'
                />
              </div>
              {isDropdownVisible && (
                <DropDown
                  settings={settings}
                  settingSelection={handleSettingSelection}
                  open={showDropDown}
                />
              )}
            </button>
          </li>
        </ul>
      </nav>
      <div className='buttonContainer'>
        <button
          className={isMac ? 'hide' : 'titlebar-button minimize'}
          onClick={handleMinimize}
        >
          <div className='min'></div>
        </button>
        <button
          className={isMac ? 'hide' : 'titlebar-button close'}
          onClick={closeWindow}
        >
          <div className='x'>
            <div className='x xi'></div>
          </div>
        </button>
      </div>
      {currentDialog === Dialog.Settings && <Settings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.LightSettings && connected && <LightSettings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.Help && <Help onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.About && <About onClose={() => setCurrentDialog(Dialog.None)} />}
      {displayResetDialog && <RecoverDialog onClose={() => setDisplayResetDialog(false)} />}
    </div>
  );
}

export default TitleBar;
