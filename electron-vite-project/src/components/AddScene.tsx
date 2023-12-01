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
 * @file AddScene.tsx
 */
import React, { useState, useCallback, useContext, useEffect } from 'react';
import Button from './Button';
import './AddScene.css';
import { useConnectionContext } from './ConnectionContext';
import { TranslationContext } from './TranslationContext';
import AdminPassword from './AdminPassword';

interface AddSceneProps {
  onClose: () => void;
}

function AddScene({ onClose }: AddSceneProps) {
  const { t } = useContext(TranslationContext);
  const [name, setName] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const { emit } = useConnectionContext();

  const handleNameChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setName(event.target.value);
  };

  const handleCheckboxChange = () => {
    setIsChecked((prevChecked) => !prevChecked);
  };

  const handleSave = () => {
    if (name !== '') {
      console.log('Save scene');
      if (!isChecked) {
        const scene = {
          name: name,
          saved: false,
        };
        addScene(emit, scene);
      } else {
        setShowAdminPassword(true);
      }
    } else {
      // If the name is empty, the text box will be highlighted in red
      const textBox = document.getElementsByClassName('AddSceneTextBox')[0] as HTMLInputElement;
      if (textBox) {
        textBox.classList.add('error-outline');
        textBox.focus();
        setTimeout(() => {
          textBox.classList.remove('error-outline');
        }, 4000);
      }
    }
  };

  const handleAdminPasswordConfirm = useCallback(
    (isConfirmed: boolean | ((prevState: boolean) => boolean)) => {
      if (isConfirmed) {
        const scene = {
          name: name,
          saved: true,
        };
        addScene(emit, scene);
      }
    },
    [name]
  );

  const addScene = (emit: any, scene: { name: string; saved: boolean }) => {
    emit('scene_add', { scene });
    onClose();
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [name, isChecked]);

  return (
    <div>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />{' '}
      {/* Overlay to close the modal when clicked outside */}
      {showAdminPassword ? (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setShowAdminPassword(false)}
        />
      ) : (
        <div className='AddSceneContainer window'>
          <Button
            onClick={onClose}
            className='buttonClose'
          >
            <div className='removeIcon centerIcon'></div>
          </Button>
          <div className='AddSceneContent'>
            <span className='AddSceneTitle'>{t('as_title')}</span>
            <input
              className='LightSettingsTextBox AddSceneTextBox'
              type='text'
              placeholder='Name'
              value={name}
              onChange={handleNameChange}
              autoFocus // Activate autofocus
            />
            <div className='AddSceneChecker'>
              <input
                type='checkbox'
                id='checkboxId'
                checked={isChecked}
                onChange={handleCheckboxChange}
              />
              <label htmlFor='checkboxId'>{t('as_checkbox')}</label>
            </div>
            <div className='AddSceneNote'>
              <span>❕ {t('as_note')}</span>
            </div>
          </div>
          <div className='AddSceneFooter'>
            <div className='controlButtons AddSceneButtons'>
              <Button
                onClick={handleSave}
                className='controlButton'
              >
                {t('as_save')}
              </Button>
              <Button
                onClick={onClose}
                className='controlButton'
              >
                {t('as_cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddScene;
