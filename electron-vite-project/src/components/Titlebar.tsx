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
import DropDown, { DropDownItem } from './DropDown';
import LightSettings from './LightSettings';
import Help from './Help';
import About from './About';
import IconSettings from '@/assets/IconSettings';
import IconFullscreen from '@/assets/IconFullscreen';
import IconHelp from '@/assets/IconHelp';
import IconWindow from '@/assets/IconWindow';
import IconLight from '@/assets/IconLight';
import IconAbout from '@/assets/IconAbout';
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
  const dropDownRef = useRef<HTMLLIElement | null>(null);
  const [platform, setPlatform] = useState<string | null>(null); // Only known in Electron
  const isMac = platform === 'darwin';
  const [currentDialog, setCurrentDialog] = useState(Dialog.None);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displayResetDialog, setDisplayResetDialog] = useState(false);

  // Platform detection and initial full screen state
  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getPlatform().then(setPlatform);
      window.electronAPI.getFullScreen().then(setIsFullscreen);
      return;
    }

    // In the browser full screen can also be left with ESC
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Effect for reset / recover dialog detection
  useEffect(() => {
    const showResetDialog = () => setDisplayResetDialog(true);
    on('recover_dialog', showResetDialog);
    return () => off('recover_dialog', showResetDialog);
  }, [on, off]);

  const toggleFullScreen = async () => {
    if (window.electronAPI) {
      window.electronAPI.send('toggle-full-screen');
      setIsFullscreen((prev) => !prev);
    } else if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleMinimize = () => {
    window.electronAPI?.send('minimize');
  };

  const closeWindow = () => {
    emit('turn_off');
    window.electronAPI?.send('close');
  };

  const settings: DropDownItem[] = [
    { icon: IconSettings, text: t('dd_settings'), onSelect: () => setCurrentDialog(Dialog.Settings) },
    { icon: IconLight, text: t('dd_lights'), onSelect: () => setCurrentDialog(Dialog.LightSettings) },
    { icon: IconHelp, text: t('dd_help'), onSelect: () => setCurrentDialog(Dialog.Help) },
    { icon: IconAbout, text: t('dd_about'), onSelect: () => setCurrentDialog(Dialog.About) },
    {
      icon: isFullscreen ? IconWindow : IconFullscreen,
      text: isFullscreen ? t('dd_window') : t('dd_fullscreen'),
      onSelect: () => {
        toggleFullScreen().catch((error) => console.error('Could not toggle full screen:', error));
      },
    },
  ];

  const handleSettingSelection = (selectedSetting: DropDownItem) => {
    setShowDropDown(false);
    selectedSetting.onSelect();
  };

  // Closes the drop down if the user clicks outside of it or presses ESC
  useEffect(() => {
    if (!showDropDown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropDownRef.current && !dropDownRef.current.contains(event.target as Node)) {
        setShowDropDown(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowDropDown(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropDown]);

  // Timeout for the dropdown animation
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    if (!showDropDown && isDropdownVisible) {
      timeout = setTimeout(() => {
        setIsDropdownVisible(false);
      }, 150);
    } else if (showDropDown && !isDropdownVisible) {
      setIsDropdownVisible(true);
    }
    return () => clearTimeout(timeout);
  }, [showDropDown, isDropdownVisible]);

  return (
    <div className={`titlebarComp ${showDropDown ? 'active' : ''}`}>
      <nav>
        <ul>
          <li>
            <div className={isMac ? 'hiddenlogo' : 'logo'}></div>
          </li>
          <li ref={dropDownRef}>
            <button
              onClick={() => setShowDropDown(!showDropDown)}
              aria-label={t('dd_settings')}
              aria-haspopup='menu'
              aria-expanded={showDropDown}
            >
              <div className={`settingsButton ${showDropDown ? 'active' : ''}`}>
                <IconSettings
                  size='20px'
                  color='var(--secondary)'
                />
              </div>
            </button>
            {isDropdownVisible && (
              <DropDown
                settings={settings}
                settingSelection={handleSettingSelection}
                open={showDropDown}
              />
            )}
          </li>
        </ul>
      </nav>
      {platform !== null && (
        <div className='buttonContainer'>
          <button
            className={isMac ? 'hide' : 'titlebar-button minimize'}
            onClick={handleMinimize}
            aria-label={t('minimize')}
          >
            <div className='min'></div>
          </button>
          <button
            className={isMac ? 'hide' : 'titlebar-button close'}
            onClick={closeWindow}
            aria-label={t('close')}
          >
            <div className='x'>
              <div className='x xi'></div>
            </div>
          </button>
        </div>
      )}
      {currentDialog === Dialog.Settings && <Settings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.LightSettings && connected && <LightSettings onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.Help && <Help onClose={() => setCurrentDialog(Dialog.None)} />}
      {currentDialog === Dialog.About && <About onClose={() => setCurrentDialog(Dialog.None)} />}
      {displayResetDialog && <RecoverDialog onClose={() => setDisplayResetDialog(false)} />}
    </div>
  );
}

export default TitleBar;
