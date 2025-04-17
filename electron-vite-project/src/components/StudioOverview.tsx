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
 * @file StudioOverview.tsx
 */
import React, { useCallback, useContext, useMemo, useState } from 'react';
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
}

const StudioOverview: React.FC<StudioOverviewProps> = ({ handleGlowAndFocus }) => {
  const { t } = useContext(TranslationContext);
  const masterValue = useFaderValue(0, 0);
  const memoizedMasterValue = useMemo(() => masterValue, [masterValue]);

  const [studioRows] = useState(6);
  const [studioColumns] = useState(4);

  const gridHeight = 150;
  const greenScreen = 14;

  const selectedSliders = useMemo(
    () => [
      { id: 5, row: 0, col: 0, type: spot },
      { id: 5, row: 0, col: 1, type: fillLight },
      { id: 6, row: 0, col: 2, type: fillLight },
      { id: 6, row: 0, col: 3, type: spot },
      { id: 4, row: 1, col: 0, type: fillLight },
      { id: 4, row: 1, col: 1, type: fillLight },
      { id: 7, row: 1, col: 2, type: fillLight },
      { id: 7, row: 1, col: 3, type: fillLight },
      { id: 3, row: 2, col: 0, type: spot },
      { id: 3, row: 2, col: 1, type: fillLight },
      { id: 8, row: 2, col: 2, type: fillLight },
      { id: 8, row: 2, col: 3, type: spot },
      { id: 2, row: 3, col: 0, type: spot },
      { id: 2, row: 3, col: 1, type: spot },
      { id: 9, row: 3, col: 2, type: fillLight },
      { id: 9, row: 3, col: 3, type: spot },
      { id: 1, row: 4, col: 0, type: spot },
      { id: 1, row: 4, col: 1, type: fillLight },
      { id: 10, row: 4, col: 3, type: spot },
    ],
    []
  );

  const customLights = [
    {
      type: 'greenscreen',
      groupId: greenScreen,
      count: 6,
      useSchein2: true,
      imageSrc: biColor,
      label: 'Greenscreen',
      top: 60,
      left: 0,
    },
    {
      type: 'single',
      groupId: 11,
      flip: true,
      imageSrc: spot,
      label: t('testchart'),
      top: 750,
      left: 170,
    },
    {
      type: 'single',
      groupId: 12,
      flip: true,
      imageSrc: spot,
      label: t('testchart'),
      top: 750,
      left: 270,
    },
    {
      type: 'single',
      groupId: 13,
      flip: true,
      imageSrc: spot,
      label: 'HMI',
      top: 50,
      left: 500,
    },
  ];

  const traversen = [
    { top: 720, left: 74, groupId: 15 }, // T1
    { top: 401, left: 74, groupId: 16 }, // T2
    { top: 82, left: 74, groupId: 17 }, // T3
    { top: 82, left: 731, groupId: 18 }, // T4
    { top: 401, left: 731, groupId: 19 }, // T5
    { top: 566, left: 731, groupId: 20 }, // T6
    { top: 720, left: 614, groupId: 21 }, // T7
  ];

  const grid = useMemo(
    () =>
      Array(studioRows)
        .fill(undefined)
        .map(() => Array(studioColumns).fill(undefined)),
    []
  );

  const FaderValueDisplay = useCallback(
    ({ groupId, faderId }: { groupId: number; faderId: number }) => {
      const value = useFaderValue(groupId, faderId);
      if (value === 0) return <div className='studioOverviewInfopanelBrightness'>{t('Off')}</div>;
      const brightness = ((value * 10) / 255) * ((memoizedMasterValue * 10) / 255);
      return <div className='studioOverviewInfopanelBrightness'>{brightness.toFixed(0) === '0' ? t('Off') : brightness.toFixed(0) + '%'}</div>;
    },
    [memoizedMasterValue, t]
  );

  const LightOpacity = useCallback(
    ({ groupId, faderId, useSchein2, flip }: { groupId: number; faderId: number; useSchein2?: boolean; flip?: boolean }) => {
      const value = useFaderValue(groupId, faderId);
      if (value === 0) return null;
      const opacity = (value / 255) * (memoizedMasterValue / 255);
      return (
        <img
          src={useSchein2 ? schein2 : schein}
          alt='schein'
          className='schein'
          style={{
            opacity: opacity,
            filter: 'blur(5px)',
            transform: flip ? 'rotate(180deg) translate(10px, -85px)' : groupId === greenScreen ? 'translate(0, 17px)' : 'none',
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
            useSchein2={selectedSlider.type === fillLight}
          />
          <img
            src={selectedSlider.type}
            alt='Lamp'
            className={`studioOverviewLamp ${isRightSide ? 'lampMirrored' : ''}`}
            onClick={() => handleGlowAndFocus(selectedSlider.id)}
            style={{ cursor: 'pointer' }}
          />
          <div
            className='studioOverviewInfopanel'
            onClick={() => handleGlowAndFocus(selectedSlider.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className='studioOverviewInfopanelText'>#{selectedSlider.id}</div>
            <FaderValueDisplay
              groupId={selectedSlider.id}
              faderId={0}
            />
          </div>
        </div>
      );
    },
    [handleGlowAndFocus, FaderValueDisplay, LightOpacity]
  );

  return (
    <div className='overview window'>
      <div className='studioOverview window'>
        {customLights.map((light, idx) => {
          if (light.type === 'greenscreen') {
            const mirroredAfter = Math.ceil(light.count! / 2);
            return (
              <div
                className='studioOverviewGreenscreen'
                key={`greenscreen-${idx}`}
                style={{ position: 'absolute', top: light.top, left: light.left }}
              >
                <div
                  className='studioOverviewInfopanel studioOverviewInfopanelGreenscreen'
                  onClick={() => handleGlowAndFocus(light.groupId)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className='studioOverviewInfopanelText'>{light.label}</div>
                  <FaderValueDisplay
                    groupId={light.groupId}
                    faderId={0}
                  />
                </div>
                {[...Array(light.count)].map((_, index) => (
                  <div
                    className='studioOverviewLight'
                    key={`gs-light-${index}`}
                  >
                    <LightOpacity
                      groupId={light.groupId}
                      faderId={0}
                      useSchein2={light.useSchein2}
                    />
                    <img
                      src={light.imageSrc}
                      alt='Lamp'
                      className={`studioOverviewGreenscreenLamp studioOverviewLamp ${index >= mirroredAfter ? 'lampMirrored' : ''}`}
                      onClick={() => handleGlowAndFocus(light.groupId)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            );
          }
          return (
            <div
              className='studioOverviewLight'
              key={`custom-light-${light.groupId}`}
              style={{ position: 'absolute', top: light.top, left: light.left }}
            >
              <LightOpacity
                groupId={light.groupId}
                faderId={0}
                flip={light.flip}
              />
              <img
                src={light.imageSrc}
                alt='Lamp'
                className='studioOverviewTestchartLamp'
                onClick={() => handleGlowAndFocus(light.groupId)}
                style={{ cursor: 'pointer' }}
              />
              <div
                className='studioOverviewInfopanel studioOverviewInfopanelTestchart'
                onClick={() => handleGlowAndFocus(light.groupId)}
                style={{ cursor: 'pointer' }}
              >
                <div className='studioOverviewInfopanelText'>{light.label}</div>
                <FaderValueDisplay
                  groupId={light.groupId}
                  faderId={0}
                />
              </div>
            </div>
          );
        })}
        <div
          className='studioOverviewLights'
          style={{ top: gridHeight }} // 140 default
        >
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
        <div className='studioOverviewTraversen'>
          {traversen.map((traverse, index) => (
            <div
              key={index}
              style={{ top: `${traverse.top}px`, left: `${traverse.left}px`, position: 'fixed' }}
            >
              <div style={{ top: `${traverse.top}px`, left: `${traverse.left}px`, position: 'fixed' }}>
                <LightBeam
                  master={memoizedMasterValue}
                  main={useFaderValue(traverse.groupId, 0)}
                  red={useFaderValue(traverse.groupId, 1)}
                  green={useFaderValue(traverse.groupId, 2)}
                  blue={useFaderValue(traverse.groupId, 3)}
                />
              </div>
              <div
                className={`studioOverviewInfopanel studioOverviewInfopanelTraverse${index}`}
                onClick={() => handleGlowAndFocus(traverse.groupId)}
                style={{ cursor: 'pointer' }}
              >
                <div className='studioOverviewInfopanelText'>{t('Traverse ' + (index + 1))}</div>
                <FaderValueDisplay
                  groupId={traverse.groupId}
                  faderId={0}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(StudioOverview);
