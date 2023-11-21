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
import { useState, useContext, Fragment } from 'react';
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

  // Toggle the open state of a FAQ
  const toggleFaq = (faqKey: string) => {
    setOpenFaqs((prevOpenFaqs: { [key: string]: boolean }) => ({
      ...prevOpenFaqs,
      [faqKey]: !prevOpenFaqs[faqKey],
    }));
  };

  // Render the answers with line breaks
  const renderAnswer = (answer: string) => {
    return answer.split('\n').map((line, index) => (
      <Fragment key={index}>
        {line}
        <br />
      </Fragment>
    ));
  };

  const faqs = [
    { key: 'faq1', question: t('q1'), answer: t('a1') },
    { key: 'faq2', question: t('q2'), answer: t('a2') },
    { key: 'faq3', question: t('q3'), answer: t('a3') },
    { key: 'faq4', question: t('q4'), answer: t('a4') },
    { key: 'faq5', question: t('q5'), answer: t('a5') },
    { key: 'faq6', question: t('q6'), answer: t('a6') },
    { key: 'faq7', question: t('q7'), answer: t('a7') },
    { key: 'faq8', question: t('q8'), answer: t('a8') },
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
                <div key={faq.key}>
                  <div
                    className='faqQuestion'
                    onClick={() => toggleFaq(faq.key)}
                  >
                    <span className={`arrow ${openFaqs[faq.key as keyof typeof openFaqs] && 'open'}`}>➜</span>
                    {faq.question}
                  </div>
                  <div className={`faqAnswer ${openFaqs[faq.key as keyof typeof openFaqs] && 'open'}`}>
                    <div className='faqAnswerInner'>{renderAnswer(faq.answer)}</div>
                  </div>
                  <hr />
                </div>
              ))}
              <span className='ask'>
                {t('help_text1')}&nbsp;
                <a
                  href='https://th-koeln.sciebo.de/s/FwaIna4jLv9NfWj'
                  target='_blank'
                  rel='noopener noreferrer'
                  style={{ textDecoration: 'underline' }}
                >
                  {t('help_text2')}
                </a>
                &nbsp;
                {t('help_text3')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Help;
