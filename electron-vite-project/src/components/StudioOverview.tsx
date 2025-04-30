/**
 * Luminous – StudioOverview.tsx
 * Web-Based Lighting Control System
 */

import React, { useContext, useEffect, useState, useCallback } from 'react';
import '../Studio.css';
import schein from '../assets/schein3.png';
import schein2 from '../assets/schein2.png';
import spotImg from '../assets/SpotTop.png';
import fillImg from '../assets/FillTop.png';
import biColor from '../assets/BiColorTop.png';
import rgbTop from '../assets/rgbTop.png';
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

const GRID_W = 604;
const GRID_H = 555;
const GRID_TOP = 150;
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

// mappt Icon auf Bild
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

// Helligkeitsanzeige
const FaderText: React.FC<{ gid: number; max: number }> = ({ gid, max }) => {
  const { t } = useContext(TranslationContext);
  const v = useFaderValue(gid, 0);
  if (v === 0) return <div className='studioOverviewInfopanelBrightness'>{t('Off')}</div>;
  const pct = ((v * 10) / 255) * ((max * 10) / 255);
  return <div className='studioOverviewInfopanelBrightness'>{pct.toFixed(0)}%</div>;
};

// Schein-Effekt
const ScheinImg: React.FC<{ gid: number; max: number; use2?: boolean; flip?: boolean; gs?: boolean; g?: boolean }> = ({ gid, max, use2, flip, gs, g }) => {
  const v = useFaderValue(gid, 0);
  if (v === 0) return null;
  const op = (v / 255) * (max / 255);
  return (
    <img
      src={use2 ? schein2 : schein}
      className='schein'
      style={{
        opacity: op,
        filter: 'blur(5px)',
        // Wenn flip=true: rotieren+verschieben. Wenn gs=true: leicht nach unten. Sonst (flip=false): nach oben verschieben.
        transform: flip ? 'rotate(180deg) translate(10px,-85px)' : gs ? 'translate(0,-90px)' : g ? 'translateY(10px)' : 'translateY(-10px)',
      }}
      alt=''
    />
  );
};

// TraverseItem als separate Komponente
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
      console.log('Data fetched/reloaded');
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
          <div
            className='studioOverviewGreenscreen'
            style={{ position: 'absolute', top: 60, left: 0 }}
          >
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
                  use2
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
          const useSchein2 = l.icon === 'Fill';

          return (
            <div
              key={l.uuid}
              className='studioOverviewLight'
              style={{ position: 'absolute', top: l.top, left: l.left }}
            >
              <ScheinImg
                gid={l.deviceId}
                max={master}
                flip={l.flip}
                use2={useSchein2}
                gs
              />
              {img && (
                <img
                  src={img}
                  alt=''
                  className={`studioOverviewTestchartLamp ${mirrored ? 'lampMirrored' : ''}`}
                  style={{
                    cursor: 'pointer',
                    position: 'relative', // Behalten wir vorerst bei, falls CSS darauf angewiesen ist
                    zIndex: 1,
                    // Wenn flip=true: rotieren. Wenn flip=false: nach oben verschieben.
                    transform: l.flip ? 'rotate(180deg)' : 'translate(10px, -60px)',
                  }}
                  onClick={() => handleGlowAndFocus(l.deviceId)}
                />
              )}
              <div
                className='studioOverviewInfopanel studioOverviewInfopanelTestchart'
                style={{ position: 'relative', zIndex: 0 }}
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
        <div
          className='studioOverviewLights'
          style={{ top: GRID_TOP }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateRows: `repeat(${rows},1fr)`,
              gridTemplateColumns: `repeat(${cols},1fr)`,
              gap: 5,
              width: GRID_W,
              height: GRID_H,
              alignItems: 'center',
              justifyItems: 'center',
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
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`studioOverviewLight ${right ? 'marginLeft45' : 'marginRight45'}`}
                  >
                    {img && (
                      <ScheinImg
                        gid={cell.id}
                        max={master}
                        use2={cell.icon === 'Fill'}
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
