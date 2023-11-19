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
 * @file Help.tsx
 */
import { useState, useContext, useEffect } from 'react';
import './Help.css';
import Button from './Button';
import { TranslationContext } from './TranslationContext';

interface SettingsProps {
  onClose: () => void;
}

function Help({ onClose }: SettingsProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useContext(TranslationContext);
  const [openFaqs, setOpenFaqs] = useState({});

  const handleClose = () => {
    setIsOpen(false);
    onClose();
  };

  if (!isOpen) {
    return null; // Render nothing if the modal is closed
  }

  const toggleFaq = (faqKey: string) => {
    setOpenFaqs((prevOpenFaqs: { [key: string]: boolean }) => ({
      ...prevOpenFaqs,
      [faqKey]: !prevOpenFaqs[faqKey],
    }));
  };

  const faqs = [
    { key: 'faq1', question: 'Wie mache ich X?', answer: 'So machst du X.' },
    { key: 'faq2', question: 'Wo finde ich Y?', answer: 'Y findest du hier.' },
  ];

  return (
    <>
      <div
        className='backgroundOverlay'
        onClick={handleClose}
      />
      <div className='LightSettingsContainer'>
        <Button
          onClick={handleClose}
          className='buttonClose'
        >
          <div className='removeIcon centerIcon'></div>
        </Button>
        <div className='SettingsTitle'>
          <span>{t('help')}</span>
        </div>
        <div className='SettingsContent innerWindow'>
          <div className='SettingsOption'>
            <div className='faqContainer'>
              {faqs.map((faq) => (
                <div
                  key={faq.key}
                  className='faq-item'
                >
                  <div
                    className='faq-question'
                    onClick={() => toggleFaq(faq.key)}
                  >
                    <span className={`arrow ${openFaqs[faq.key as keyof typeof openFaqs] && 'open'}`}>➜</span>
                    {faq.question}
                  </div>
                  <div className={`faq-answer { ${openFaqs[faq.key as keyof typeof openFaqs] && 'open'}`}>{faq.answer}</div>
                  <hr />
                </div>
              ))}
              <span className='ask'>{t('help_text')}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Help;
