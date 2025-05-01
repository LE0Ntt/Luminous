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
import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../Studio.css';
import glare from '../assets/GlareNarrow.png';
import glareWide from '../assets/GlareWide.png';
import spotImg from '../assets/SpotTop.png';
import fillImg from '../assets/FillTop.png';
import biColor from '../assets/BiColorTop.png';
import rgbTop from '../assets/RGBTop.png';
import LightBeam from './LightBeam';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import { useFaderValue } from './FaderContext';

interface StudioOverviewProps {
  handleGlowAndFocus: (id: number) => void;
}

interface GridCell {
  id: number;
  row: number;
  col: number;
  icon: 'RGB' | 'LED' | 'Spot' | 'Fill' | 'None';
}
interface CustomCfg {
  uuid: string;
  deviceId: number;
  icon: 'RGB' | 'LED' | 'Spot' | 'Fill' | 'None';
  left: number;
  top: number;
  flip: boolean;
  label?: string;
}
interface TraverseCfg {
  groupId: number;
}

const GS_COUNT = 6;

const traversePos = [
  { top: 720, left: 74 },
  { top: 401, left: 74 },
  { top: 82, left: 74 },
  { top: 82, left: 731 },
  { top: 401, left: 731 },
  { top: 566, left: 731 },
  { top: 720, left: 614 },
];

const imgByIcon = (icon: string) => {
  switch (icon) {
    case 'RGB':
      return rgbTop;
    case 'LED':
      return biColor;
    case 'Spot':
      return spotImg;
    case 'Fill':
      return fillImg;
    default:
      return null;
  }
};

const FaderText: React.FC<{ gid: number; max: number }> = ({ gid, max }) => {
  const { t } = useContext(TranslationContext);
  const v = useFaderValue(gid, 0);
  if (v === 0) return <div className='studioOverviewInfopanelBrightness'>{t('Off')}</div>;
  const pct = ((v * 10) / 255) * ((max * 10) / 255);
  return <div className='studioOverviewInfopanelBrightness'>{pct.toFixed(0)}%</div>;
};

const ScheinImg: React.FC<{ gid: number; max: number; useWide?: boolean; flip?: boolean; gs?: boolean; g?: boolean }> = ({ gid, max, useWide, flip, gs, g }) => {
  const v = useFaderValue(gid, 0);
  if (v === 0) return null;
  const op = (v / 255) * (max / 255);
  return (
    <img
      src={useWide ? glareWide : glare}
      className='glare'
      style={{
        opacity: op,
        filter: 'blur(5px)',
        transform: flip ? 'rotate(180deg) translate(10px,-85px)' : gs ? 'translate(0,-90px)' : g ? 'translateY(10px)' : 'translateY(-10px)',
      }}
      alt=''
    />
  );
};

interface TraverseItemProps {
  groupId: number;
  pos: { top: number; left: number };
  index: number;
  handleGlowAndFocus: (id: number) => void;
  master: number;
}
const TraverseItem: React.FC<TraverseItemProps> = ({ groupId, pos, index, handleGlowAndFocus, master }) => {
  const main = useFaderValue(groupId, 0);
  const red = useFaderValue(groupId, 1);
  const green = useFaderValue(groupId, 2);
  const blue = useFaderValue(groupId, 3);
  if (!groupId) return null;
  return (
    <div style={{ position: 'fixed', top: pos.top, left: pos.left }}>
      <div style={{ position: 'fixed', top: pos.top, left: pos.left }}>
        <LightBeam
          master={master}
          main={main}
          red={red}
          green={green}
          blue={blue}
        />
      </div>
      <div
        className={`studioOverviewInfopanel studioOverviewInfopanelTraverse${index}`}
        onClick={() => handleGlowAndFocus(groupId)}
      >
        <div className='studioOverviewInfopanelText'>{`${index + 1}. Traverse`}</div>
        <FaderText
          gid={groupId}
          max={master}
        />
      </div>
    </div>
  );
};

export default React.memo(function StudioOverview({ handleGlowAndFocus }: StudioOverviewProps) {
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const master = useFaderValue(0, 0);

  const [rows, setRows] = useState(6);
  const [cols, setCols] = useState(4);
  const [gridCfg, setGridCfg] = useState<GridCell[]>([]);
  const [customCfg, setCustomCfg] = useState<CustomCfg[]>([]);
  const [travCfg, setTravCfg] = useState<TraverseCfg[]>([]);
  const [greenId, setGreenId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${url}/studio_grid`);
      const txt = await res.text();
      if (txt.trim().startsWith('<')) return; // ignore HTML
      let data: any = txt;
      try {
        data = JSON.parse(data);
      } catch {}
      if (typeof data === 'string') data = JSON.parse(data);
      setRows(+data.meta?.rows || 6);
      setCols(+data.meta?.cols || 4);
      setGridCfg(data.grid || []);
      setCustomCfg(data.custom || []);
      setTravCfg(data.traversen || []);
      setGreenId(data.greenScreenId ?? null);
    } catch (error) {
      console.error('Failed to fetch studio grid data:', error);
    }
  }, [url]);

  useEffect(() => {
    fetchData();

    const handleReload = () => {
      console.log('Reload event triggered');
      fetchData();
    };

    window.addEventListener('reload', handleReload as EventListener);

    return () => {
      window.removeEventListener('reload', handleReload as EventListener);
    };
  }, [fetchData]);

  return (
    <div className='overview window'>
      <div className='studioOverview window'>
        {/* Greenscreen */}
        {greenId && (
          <div className='studioOverviewGreenscreen'>
            <div
              className='studioOverviewInfopanel studioOverviewInfopanelGreenscreen'
              onClick={() => handleGlowAndFocus(greenId)}
            >
              <div className='studioOverviewInfopanelText'>{t('Greenscreen')}</div>
              <FaderText
                gid={greenId}
                max={master}
              />
            </div>
            {[...Array(GS_COUNT)].map((_, i) => (
              <div
                className='studioOverviewLight'
                key={i}
              >
                <ScheinImg
                  gid={greenId}
                  max={master}
                  useWide
                  g
                />
                <img
                  src={biColor}
                  alt=''
                  className={`studioOverviewGreenscreenLamp studioOverviewLamp ${i >= GS_COUNT / 2 ? 'lampMirrored' : ''}`}
                  onClick={() => handleGlowAndFocus(greenId)}
                />
              </div>
            ))}
          </div>
        )}
        {/* Custom Lamps */}
        {customCfg.map((l) => {
          const img = imgByIcon(l.icon);
          if (!l.deviceId) return null;
          const mirrored = l.left > 802 / 2;
          const useSchein2 = l.icon === 'Fill' || l.icon === 'LED';
          return (
            <div
              key={l.uuid}
              className='studioOverviewLight'
              style={{ position: 'absolute', top: l.top + 30, left: l.left }}
            >
              {img && l.icon !== 'RGB' && (
                <ScheinImg
                  gid={l.deviceId}
                  max={master}
                  flip={l.flip}
                  useWide={useSchein2}
                  gs
                />
              )}
              {img && (
                <img
                  src={img}
                  alt=''
                  className={`studioOverviewCustomLamp ${mirrored ? 'lampMirrored' : ''}`}
                  style={{
                    position: 'relative',
                    transform: l.flip ? (mirrored ? 'rotate(180deg)' : 'rotate(180deg)  rotateY(180deg)') : mirrored ? 'rotateY(180deg) translate(-10px, -60px)' : 'translate(10px, -60px)',
                  }}
                  onClick={() => handleGlowAndFocus(l.deviceId)}
                />
              )}
              {!img && <div style={{ height: 50 }}></div>}
              <div
                className='studioOverviewInfopanel studioOverviewInfopanelCustom'
                onClick={() => handleGlowAndFocus(l.deviceId)}
              >
                <div className='studioOverviewInfopanelText'>{l.label || `#${l.deviceId}`}</div>
                <FaderText
                  gid={l.deviceId}
                  max={master}
                />
              </div>
            </div>
          );
        })}
        {/* Grid Lights */}
        <div className='SettingsOverviewImageForeground'>
          <div
            className='SettingsOverviewImageGrid'
            style={{
              gridTemplateRows: `repeat(${rows},1fr)`,
              gridTemplateColumns: `repeat(${cols},1fr)`,
            }}
          >
            {Array.from({ length: rows }).flatMap((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const cell = gridCfg.find((g) => g.row === r && g.col === c);
                if (!cell || !cell.id) {
                  return <div key={`${r}-${c}`} />;
                }
                const img = imgByIcon(cell.icon);
                const right = c >= cols / 2;
                const center = cols % 2 === 1 && c === Math.floor(cols / 2);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`studioOverviewLight`}
                    style={{ justifySelf: right ? 'flex-end' : center ? 'center' : 'flex-start' }}
                  >
                    {img && cell.icon !== 'RGB' && (
                      <ScheinImg
                        gid={cell.id}
                        max={master}
                        useWide={cell.icon === 'Fill' || cell.icon === 'LED'}
                      />
                    )}
                    {img && (
                      <img
                        src={img}
                        alt=''
                        className={`studioOverviewLamp ${right ? 'lampMirrored' : ''}`}
                        onClick={() => handleGlowAndFocus(cell.id)}
                      />
                    )}
                    <div
                      className='studioOverviewInfopanel'
                      onClick={() => handleGlowAndFocus(cell.id)}
                    >
                      <div className='studioOverviewInfopanelText'>#{cell.id}</div>
                      <FaderText
                        gid={cell.id}
                        max={master}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Traversen */}
        {travCfg.map((t, i) => (
          <TraverseItem
            key={i}
            groupId={t.groupId}
            pos={traversePos[i]}
            index={i}
            handleGlowAndFocus={handleGlowAndFocus}
            master={master}
          />
        ))}
      </div>
    </div>
  );
});
