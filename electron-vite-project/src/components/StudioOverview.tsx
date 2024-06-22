import React, { useCallback, useContext, useMemo } from 'react';
import '../Studio.css';
import schein from '../assets/schein3.png';
import schein2 from '../assets/schein2.png';
import spot from '../assets/SpotTop.png';
import fillLight from '../assets/FillTop.png';
import biColor from '../assets/BiColorTop.png';
import LightBeam from './LightBeam';
import { TranslationContext } from './TranslationContext';
import { useFaderValue } from './FaderContext';

interface StudioOverviewProps {
  handleGlowAndFocus: (id: number) => void;
  sliders?: any[]; // Make sliders optional
}

const StudioOverview: React.FC<StudioOverviewProps> = ({ handleGlowAndFocus, sliders = [] }) => {
  // Provide default empty array
  const { t } = useContext(TranslationContext);
  const masterValue = useFaderValue(0, 0);
  const memoizedMasterValue = useMemo(() => masterValue, [masterValue]);

  const studioRows = 6;
  const studioColumns = 4;

  const selectedSliders = useMemo(
    () => [
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
    ],
    []
  );

  const grid = useMemo(
    () =>
      Array(studioRows)
        .fill(undefined)
        .map(() => Array(studioColumns).fill(undefined)),
    []
  );

  const greenScreen = 14;

  const FaderValueDisplay = useCallback(
    ({ groupId, faderId }: { groupId: number; faderId: number }) => {
      const value = useFaderValue(groupId, faderId);
      const brightness = ((value * 10) / 255) * ((memoizedMasterValue * 10) / 255);
      return <div className='studioOverviewInfopanelBrightness'>{brightness.toFixed(0) === '0' ? t('Off') : brightness.toFixed(0) + '%'}</div>;
    },
    [memoizedMasterValue, t]
  );

  const LightOpacity = useCallback(
    ({ groupId, faderId }: { groupId: number; faderId: number }) => {
      const value = useFaderValue(groupId, faderId);
      const opacity = (value / 255) * (memoizedMasterValue / 255);
      return (
        <img
          src={schein}
          alt='schein'
          className='schein'
          style={{
            opacity: opacity,
            filter: 'blur(5px)',
          }}
        />
      );
    },
    [memoizedMasterValue]
  );

  const renderLight = useCallback(
    (selectedSlider: any, isRightSide: boolean) => {
      return (
        <div className={`studioOverviewLight ${isRightSide ? 'marginLeft45' : 'marginRight45'}`}>
          <LightOpacity
            groupId={selectedSlider.id}
            faderId={0}
          />
          <div
            onClick={() => handleGlowAndFocus(selectedSlider.id)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={selectedSlider.type}
              alt='Lamp'
              className={`studioOverviewLamp ${isRightSide ? 'lampMirrored' : ''}`}
            />
            <div className='studioOverviewInfopanel'>
              <div className='studioOverviewInfopanelText'>#{selectedSlider.id}</div>
              <FaderValueDisplay
                groupId={selectedSlider.id}
                faderId={0}
              />
            </div>
          </div>
        </div>
      );
    },
    [handleGlowAndFocus, FaderValueDisplay, LightOpacity]
  );

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
            <FaderValueDisplay
              groupId={greenScreen}
              faderId={0}
            />
          </div>
          {[...Array(6)].map((_, index) => (
            <div
              className='studioOverviewLight'
              key={index}
            >
              <LightOpacity
                groupId={greenScreen}
                faderId={0}
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
                if (selectedSlider) {
                  const isRightSide = colIndex >= row.length / 2;
                  return <React.Fragment key={`${rowIndex}-${colIndex}`}>{renderLight(selectedSlider, isRightSide)}</React.Fragment>;
                }
                return <div key={`${rowIndex}-${colIndex}`} />;
              })
            )}
          </div>
        </div>
        <div className='studioOverviewTestchart'>
          {[11, 12].map((id) => (
            <div
              className='studioOverviewLight'
              key={id}
            >
              <LightOpacity
                groupId={id}
                faderId={0}
              />
              <div
                onClick={() => handleGlowAndFocus(id)}
                style={{ cursor: 'pointer' }}
              >
                <img
                  src={spot}
                  alt='Lamp'
                  className='studioOverviewTestchartLamp'
                />
                <div className='studioOverviewInfopanel studioOverviewInfopanelTestchart'>
                  <div className='studioOverviewInfopanelText'>{t('testchart')}</div>
                  <FaderValueDisplay
                    groupId={id}
                    faderId={0}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className='studioOverviewLight studioOverviewExtra'>
          <LightOpacity
            groupId={13}
            faderId={0}
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
              <FaderValueDisplay
                groupId={13}
                faderId={0}
              />
            </div>
          </div>
        </div>
        <div className='studioOverviewTraversen'>
          {[
            { top: 720, left: 74 },
            { top: 401, left: 74 },
            { top: 82, left: 74 },
            { top: 82, left: 731 },
            { top: 401, left: 731 },
            { top: 566, left: 731 },
            { top: 720, left: 614 },
          ].map((position, index) => {
            const baseIndex = 15 + index;
            return (
              <div
                key={index}
                style={{ top: `${position.top}px`, left: `${position.left}px`, position: 'fixed' }}
              >
                <div style={{ top: `${position.top}px`, left: `${position.left}px`, position: 'fixed' }}>
                  <LightBeam
                    master={memoizedMasterValue}
                    main={useFaderValue(baseIndex, 0)}
                    red={useFaderValue(baseIndex, 1)}
                    green={useFaderValue(baseIndex, 2)}
                    blue={useFaderValue(baseIndex, 3)}
                  />
                </div>
                <div
                  className={`studioOverviewInfopanel studioOverviewInfopanelTraverse${index}`}
                  onClick={() => handleGlowAndFocus(baseIndex)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='studioOverviewInfopanelText'>{t('Traverse ' + (index + 1))}</div>
                  <FaderValueDisplay
                    groupId={baseIndex}
                    faderId={0}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudioOverview);
