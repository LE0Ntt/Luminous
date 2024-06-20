import React, { useState, useContext } from 'react';
import '../Studio.css';
import schein from '../assets/schein3.png';
import schein2 from '../assets/schein2.png';
import spot from '../assets/SpotTop.png';
import fillLight from '../assets/FillTop.png';
import biColor from '../assets/BiColorTop.png';
import LightBeam from './LightBeam';
import { TranslationContext } from './TranslationContext';

interface StudioOverviewProps {
  handleGlowAndFocus: (id: number) => void;
  sliders: any;
  faderValues: any;
}

const StudioOverview: React.FC<StudioOverviewProps> = ({ handleGlowAndFocus, sliders, faderValues }) => {
  const { t } = useContext(TranslationContext);
  const [studioRows, setStudioRows] = useState(6);
  const [studioColumns, setStudioColumns] = useState(4);
  const selectedSliders = [
    { id: 5, row: 0, col: 0, fake: false, type: spot },
    { id: 5, row: 0, col: 1, fake: false, type: fillLight },
    { id: 6, row: 0, col: 2, fake: false, type: fillLight },
    { id: 6, row: 0, col: 3, fake: false, type: spot },
    { id: 4, row: 1, col: 0, fake: false, type: fillLight },
    { id: 4, row: 1, col: 1, fake: false, type: fillLight },
    { id: 7, row: 1, col: 2, fake: false, type: fillLight },
    { id: 7, row: 1, col: 3, fake: false, type: fillLight },
    { id: 3, row: 2, col: 0, fake: false, type: spot },
    { id: 3, row: 2, col: 1, fake: false, type: fillLight },
    { id: 8, row: 2, col: 2, fake: false, type: fillLight },
    { id: 8, row: 2, col: 3, fake: false, type: spot },
    { id: 2, row: 3, col: 0, fake: false, type: spot },
    { id: 2, row: 3, col: 1, fake: false, type: spot },
    { id: 9, row: 3, col: 2, fake: false, type: fillLight },
    { id: 9, row: 3, col: 3, fake: false, type: spot },
    { id: 1, row: 4, col: 0, fake: false, type: spot },
    { id: 1, row: 4, col: 1, fake: false, type: fillLight },
    { id: 10, row: 4, col: 3, fake: false, type: spot },
  ];
  // Creates an array with the number of rows and columns to be displayed in the Studio Overview
  const grid = Array(studioRows)
    .fill(undefined)
    .map(() => Array(studioColumns).fill(undefined));

  const greenScreen = 14; // Change greenScreen in the Studio Overview

  return (
    <div className='overview window'>
      <div className='studioOverview window'>
        <div className='studioOverviewGreenscreen'>
          <div
            className='studioOverviewInfopanel studioOverviewInfopanelGreenscreen'
            onClick={() => handleGlowAndFocus(greenScreen)}
            style={{ cursor: 'pointer' }}
          >
            <div className='studioOverviewInfopanelText'>Greenscreen</div>
            <div className='studioOverviewInfopanelBrightness'>
              {(((faderValues[greenScreen][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                ? t('Off')
                : (((faderValues[greenScreen][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
            </div>
          </div>
          {[...Array(6)].map((_, index) => (
            <div
              className='studioOverviewLight'
              key={index}
            >
              <img
                src={schein2}
                alt='schein'
                className='schein'
                style={{
                  top: `-35px`,
                  opacity: (faderValues[greenScreen][0] / 255) * (faderValues[0][0] / 255),
                  filter: 'blur(5px)',
                }}
              />
              <div
                onClick={() => handleGlowAndFocus(greenScreen)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={biColor}
                  alt='Lamp'
                  className={`studioOverviewGreenscreenLamp studioOverviewLamp ${index >= 3 ? 'lampMirrored' : ''}`}
                />
              </div>
            </div>
          ))}
        </div>
        <div className='studioOverviewLights'>
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${studioRows}, 1fr)`,
              gridTemplateColumns: `repeat(${studioColumns}, 1fr)`,
              gap: '5px',
              width: '604px',
              height: '672px',
              alignItems: 'center',
              justifyItems: 'center',
            }}
          >
            {grid.map((row, rowIndex) =>
              row.map((_, colIndex) => {
                const selectedSlider = selectedSliders.find((s) => s.row === rowIndex && s.col === colIndex);
                const sliderId = selectedSlider ? selectedSlider.id : null;
                const slider = sliders.find((s: any) => s.id === sliderId);
                if (selectedSlider && colIndex < row.length / 2 && selectedSlider.fake === false) {
                  return (
                    <div key={`${rowIndex}-${colIndex}`}>
                      <div className='studioOverviewLight marginRight45'>
                        {slider && (
                          <>
                            <img
                              src={selectedSlider.type === spot ? schein : schein2}
                              alt='schein'
                              className={'schein'}
                              style={{
                                opacity: (faderValues[slider.id][0] / 255) * (faderValues[0][0] / 255),
                                filter: 'blur(5px)',
                              }}
                            />
                            <div
                              onClick={() => handleGlowAndFocus(slider.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                src={selectedSlider.type}
                                alt='Lamp'
                                className='studioOverviewLamp'
                              />
                              <div className='studioOverviewInfopanel'>
                                <div className='studioOverviewInfopanelText'>#{slider.id}</div>
                                <div className='studioOverviewInfopanelBrightness'>
                                  {(((faderValues[slider.id][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                                    ? t('Off')
                                    : (((faderValues[slider.id][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                } else if (selectedSlider && colIndex >= row.length / 2 && selectedSlider.fake === false) {
                  return (
                    <div key={`${rowIndex}-${colIndex}`}>
                      <div className='studioOverviewLight marginLeft45'>
                        {slider && (
                          <>
                            <img
                              src={selectedSlider.type === spot ? schein : schein2}
                              alt='schein'
                              className={'schein'}
                              style={{
                                opacity: (faderValues[slider.id][0] / 255) * (faderValues[0][0] / 255),
                                filter: 'blur(5px)',
                              }}
                            />
                            <div
                              onClick={() => handleGlowAndFocus(slider.id)}
                              style={{ cursor: 'pointer' }}
                            >
                              <img
                                src={selectedSlider.type}
                                alt='Lamp'
                                className='studioOverviewLamp lampMirrored'
                              />
                              <div className='studioOverviewInfopanel'>
                                <div className='studioOverviewInfopanelText'>#{slider.id}</div>
                                <div className='studioOverviewInfopanelBrightness'>
                                  {(((faderValues[slider.id][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                                    ? t('Off')
                                    : (((faderValues[slider.id][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                } else if (selectedSlider && selectedSlider.fake === true) {
                  return (
                    <div key={`${rowIndex}-${colIndex}`}>
                      <div className='studioOverviewLight'>
                        {slider && (
                          <>
                            <img
                              src={spot}
                              alt='Lamp'
                              className='studioOverviewLamp lampMirrored'
                            />
                            <div className='studioOverviewInfopanel'>
                              <div className='studioOverviewInfopanelText'>#{slider.id}</div>
                              <div className='studioOverviewInfopanelBrightness'>{t('Off')}</div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                }
                return <div key={`${rowIndex}-${colIndex}`} />;
              })
            )}
          </div>
        </div>
        <div className='studioOverviewTestchart'>
          {/* 11 */}
          <div className='studioOverviewLight'>
            <img
              src={schein}
              alt='schein'
              className={'schein'}
              style={{
                opacity: (faderValues[11][0] / 255) * (faderValues[0][0] / 255),
                transform: 'rotate(180deg)',
                top: '25px',
                left: '-10px',
              }}
            />
            <div
              onClick={() => handleGlowAndFocus(11)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={spot}
                alt='Lamp'
                className='studioOverviewTestchartLamp'
              />
              <div className='studioOverviewInfopanel studioOverviewInfopanelTestchart'>
                <div className='studioOverviewInfopanelText'>{t('testchart')}</div>
                <div className='studioOverviewInfopanelBrightness'>
                  {(((faderValues[11][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                    ? t('Off')
                    : (((faderValues[11][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
                </div>
              </div>
            </div>
          </div>
          {/* 12 */}
          <div className='studioOverviewLight'>
            <img
              src={schein}
              alt='schein'
              className={'schein'}
              style={{
                opacity: (faderValues[12][0] / 255) * (faderValues[0][0] / 255),
                transform: 'rotate(180deg)',
                top: '25px',
                left: '-10px',
              }}
            />
            <div
              onClick={() => handleGlowAndFocus(12)}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={spot}
                alt='Lamp'
                className='studioOverviewTestchartLamp'
              />
              <div className='studioOverviewInfopanel studioOverviewInfopanelTestchart'>
                <div className='studioOverviewInfopanelText'>{t('testchart')}</div>
                <div className='studioOverviewInfopanelBrightness'>
                  {(((faderValues[12][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                    ? t('Off')
                    : (((faderValues[12][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 13 */}
        <div className='studioOverviewLight studioOverviewExtra'>
          <img
            src={schein}
            alt='schein'
            className={'schein'}
            style={{
              opacity: (faderValues[13][0] / 255) * (faderValues[0][0] / 255),
              transform: 'rotate(180deg)',
              top: '25px',
              left: '-10px',
            }}
          />
          <div
            onClick={() => handleGlowAndFocus(13)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={spot}
              alt='Lamp'
              className='studioOverviewTestchartLamp'
            />
            <div className='studioOverviewInfopanel studioOverviewInfopanelTestchart'>
              <div className='studioOverviewInfopanelText'>HMI</div>
              <div className='studioOverviewInfopanelBrightness'>
                {(((faderValues[13][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                  ? t('Off')
                  : (((faderValues[13][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
              </div>
            </div>
          </div>
        </div>
        <div className='studioOverviewTraversen'>
          {[
            { top: 720, left: 74 }, // T1
            { top: 401, left: 74 }, // T2
            { top: 82, left: 74 }, // T3
            { top: 82, left: 731 }, // T4
            { top: 401, left: 731 }, // T5
            { top: 566, left: 731 }, // T6
            { top: 720, left: 614 }, // T7
          ].map((position, index) => {
            const baseIndex = 15 + index;
            return (
              <div
                key={index}
                style={{ top: `${position.top}px`, left: `${position.left}px`, position: 'fixed' }}
              >
                <div style={{ top: `${position.top}px`, left: `${position.left}px`, position: 'fixed' }}>
                  <LightBeam
                    master={faderValues[0][0]}
                    main={faderValues[baseIndex][0]}
                    red={faderValues[baseIndex][1]}
                    green={faderValues[baseIndex][2]}
                    blue={faderValues[baseIndex][3]}
                  />
                </div>
                <div
                  className={`studioOverviewInfopanel studioOverviewInfopanelTraverse${index}`}
                  onClick={() => handleGlowAndFocus(baseIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='studioOverviewInfopanelText'>{t('Traverse ' + (index + 1))}</div>
                  <div className='studioOverviewInfopanelBrightness'>
                    {(((faderValues[baseIndex][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) === '0'
                      ? t('Off')
                      : (((faderValues[baseIndex][0] * 10) / 255) * ((faderValues[0][0] * 10) / 255)).toFixed(0) + '%'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudioOverview;
