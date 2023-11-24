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
 * @file DeleteScene.tsx
 */
import React, { useState, useContext, useEffect } from 'react';
import './BigView.css';
import Button from './Button';
import '../index.css';
import './AddScene.css';
import { TranslationContext } from './TranslationContext';

interface DeleteSceneProps {
  onClose: () => void;
}

function DeleteScene({ onClose }: DeleteSceneProps) {
  const { t } = useContext(TranslationContext);

  const handleDelete = () => {
    document.body.dispatchEvent(new Event('deleteScene'));
    onClose();
  };

  // Confirm with ENTER
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleDelete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div>
      <div
        className='backgroundOverlay'
        onClick={onClose}
      />{' '}
      {/* Overlay to close the modal when clicked outside */}
      <div className='AddSceneContainer window'>
        <Button
          onClick={onClose}
          className='buttonClose'
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='AddSceneContent'>
          <span className='AddSceneTitle'>{t('ds_title')}</span>
          <div className='AddSceneNote'>
            <span>❕ {t('ds_note')}</span>
          </div>
        </div>
        <div className='AddSceneFooter'>
          <div className='controlButtons AddSceneButtons'>
            <Button
              onClick={handleDelete}
              className='controlButton'
            >
              {t('ds_delete')}
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
    </div>
  );
}

export default DeleteScene;
