/**
 * Luminous - A Web-Based Lighting Control System
 *
 * TH Köln - University of Applied Sciences, institute for media and imaging technology
 * Projekt Medienproduktionstechnik & Web-Engineering
 *
 * @file CloseButton.tsx
 */
import { MutableRefObject, useContext, useEffect, useRef } from 'react';
import { TranslationContext } from './TranslationContext';

interface CloseButtonProps {
  onClose: () => void;
}

// Close handlers of all mounted dialogs, Escape only closes the most recently opened one (e.g. a password prompt above the settings)
const openDialogs: MutableRefObject<() => void>[] = [];

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') openDialogs[openDialogs.length - 1]?.current();
};

// Close button of a dialog, also closes the dialog on Escape
function CloseButton({ onClose }: CloseButtonProps) {
  const { t } = useContext(TranslationContext);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (openDialogs.length === 0) window.addEventListener('keydown', handleEscape);
    openDialogs.push(onCloseRef);

    return () => {
      openDialogs.splice(openDialogs.indexOf(onCloseRef), 1);
      if (openDialogs.length === 0) window.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <button
      className='buttonClose'
      onClick={onClose}
      aria-label={t('close')}
    >
      <div className='xClose'>
        <div className='xClose xiClose'></div>
      </div>
    </button>
  );
}

export default CloseButton;
