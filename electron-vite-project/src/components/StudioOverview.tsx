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

// --- Interfaces ---
interface StudioOverviewProps {
  handleGlowAndFocus: (id: number) => void;
  devices: DeviceConfig[];
}
interface GridCell {
  id: number;
  row: number;
  col: number;
  icon: LampIconType;
}
interface CustomCfg {
  uuid: string;
  deviceId: number;
  icon: LampIconType;
  left: number;
  top: number;
  flip: boolean;
  label?: string;
  showName?: boolean;
}
interface TraverseCfg {
  groupId: number;
}
type LampIconType = 'RGB' | 'LED' | 'Spot' | 'Fill' | 'None';
interface DeviceConfig {
  id: number;
  name: string;
}

// --- Constants ---
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

// --- Helper Functions ---
const imgByIcon = (icon: LampIconType): string | null => {
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

// --- Sub-Components ---
const FaderText: React.FC<{ gid: number; max: number }> = React.memo(({ gid, max }) => {
  const { t } = useContext(TranslationContext);
  const v = useFaderValue(gid, 0);
  if (v === 0) return <div className='studioOverviewInfopanelBrightness'>{t('Off')}</div>;
  const pct = ((v * 10) / 255) * ((max * 10) / 255);
  return <div className='studioOverviewInfopanelBrightness'>{pct.toFixed(0)}%</div>;
});

const GlareImg: React.FC<{ gid: number; max: number; useWide?: boolean; flip?: boolean; useCustomPosition?: boolean; useGreenscreenPosition?: boolean; isBiColor?: boolean }> = React.memo(({ gid, max, useWide, flip, useCustomPosition, useGreenscreenPosition, isBiColor }) => {
  const v = useFaderValue(gid, 0);
  const biValRaw = useFaderValue(gid, 1);
  if (v === 0) return null;
  const biVal = isBiColor ? biValRaw : 128;
  const op = (v / 255) * (max / 255);
  let colorFilter = '';
  if (isBiColor) {
    const normBi = (biVal - 128) / 128;
    colorFilter =
      normBi < 0
        ? `sepia(${(-normBi * 0.8).toFixed(2)}) saturate(${(1 + -normBi * 3).toFixed(2)}) hue-rotate(${(-normBi * -40).toFixed(0)}deg) `
        : `hue-rotate(${(normBi * 60).toFixed(0)}deg) `;
  }
  let transform = 'translateY(-10px)';
  if (flip) transform = 'rotate(180deg) translate(10px,-85px)';
  else if (useCustomPosition) transform = 'translate(0,-90px)';
  else if (useGreenscreenPosition) transform = 'translateY(10px)';

  return (
    <img
      src={useWide ? glareWide : glare}
      className='glare'
      style={{
        opacity: op,
        filter: `${colorFilter}blur(5px)`,
        transform,
      }}
      alt=''
    />
  );
});

const TraverseItem: React.FC<{ groupId: number; pos: { top: number; left: number }; index: number; handleGlowAndFocus: (id: number) => void; master: number }> = React.memo(({ groupId, pos, index, handleGlowAndFocus, master }) => {
  const main = useFaderValue(groupId, 0);
  const red = useFaderValue(groupId, 1);
  const green = useFaderValue(groupId, 2);
  const blue = useFaderValue(groupId, 3);
  if (!groupId) return null;
  return (
    <div style={{ position: 'fixed', top: pos.top, left: pos.left }}>
      <div style={{ position: 'fixed', top: pos.top, left: pos.left }}>
        <LightBeam master={master} main={main} red={red} green={green} blue={blue} />
      </div>
      <div className={`studioOverviewInfopanel studioOverviewInfopanelTraverse${index}`} onClick={() => handleGlowAndFocus(groupId)}>
        <div className='studioOverviewInfopanelText'>{`${index + 1}. Traverse`}</div>
        <FaderText gid={groupId} max={master} />
      </div>
    </div>
  );
});

const RgbValues: React.FC<{ gid: number; children: (values: { main: number; red: number; green: number; blue: number }) => React.ReactNode }> = ({ gid, children }) => {
  const main = useFaderValue(gid, 0);
  const red = useFaderValue(gid, 1);
  const green = useFaderValue(gid, 2);
  const blue = useFaderValue(gid, 3);
  return <>{children({ main, red, green, blue })}</>;
};

interface LampVisualProps {
  gid: number;
  icon: LampIconType;
  master: number;
  handleGlowAndFocus: (id: number) => void;
  imgSrc: string | null;
  label?: string;
  mirrored?: boolean;
  flip?: boolean;
  useCustomPositioning?: boolean;
  infoPanelClass?: string;
  lampImageClass: string;
  lampImageStyle?: React.CSSProperties;
}

const LampVisual: React.FC<LampVisualProps> = React.memo(
  ({ gid, icon, master, handleGlowAndFocus, imgSrc, label, mirrored, flip, useCustomPositioning, infoPanelClass = 'studioOverviewInfopanel', lampImageClass, lampImageStyle }) => {
    const isRgb = icon === 'RGB';
    const useWideGlare = icon === 'Fill' || icon === 'LED';
    const isBiColor = icon === 'LED';

    return (
      <RgbValues gid={gid}>
        {({ main, red, green, blue }) => (
          <>
            <div className={isRgb ? 'rgbWrapper' : ''}>
              {isRgb ? (
                <LightBeam master={master} main={main} red={red} green={green} blue={blue} />
              ) : (
                imgSrc && <GlareImg gid={gid} max={master} flip={flip} useWide={useWideGlare} useCustomPosition={useCustomPositioning} isBiColor={isBiColor} />
              )}
              {imgSrc && (
                <img
                  src={imgSrc}
                  alt={`${icon} Lamp`}
                  className={`${lampImageClass} ${mirrored ? 'lampMirrored' : ''}`}
                  style={lampImageStyle}
                  onClick={() => handleGlowAndFocus(gid)}
                />
              )}
            </div>
            {!imgSrc && !isRgb && <div style={{ height: 50 }}></div>} {/* Placeholder for 'None' icon */}
            <div className={infoPanelClass} onClick={() => handleGlowAndFocus(gid)}>
              <div className='studioOverviewInfopanelText'>{label || `#${gid}`}</div>
              <FaderText gid={gid} max={master} />
            </div>
          </>
        )}
      </RgbValues>
    );
  }
);

// --- Main Component ---
export default React.memo(function StudioOverview({ handleGlowAndFocus, devices }: StudioOverviewProps) {
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
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const txt = await res.text();
      if (txt.trim().startsWith('<')) return;
      let data: any;
      try {
        data = JSON.parse(txt);
        if (typeof data === 'string') data = JSON.parse(data);
      } catch (parseError) {
        console.error('Failed to parse studio grid data:', parseError, 'Raw text:', txt);
        return;
      }
      setRows(+data.meta?.rows || 6);
      setCols(+data.meta?.cols || 4);
      setGridCfg(data.grid || []);
      setCustomCfg(
        (data.custom || []).map((l: any) => ({
          uuid: l.uuid ?? crypto.randomUUID(),
          deviceId: Number(l.deviceId),
          icon: l.icon as LampIconType,
          left: Number(l.left ?? 0),
          top: Number(l.top ?? 0),
          flip: !!l.flip,
          label: l.label,
          showName: !!l.showName,
        }))
      );
      setTravCfg(data.traversen || []);
      setGreenId(data.greenScreenId ?? null);
    } catch (error) {
      console.error('Failed to fetch studio grid data:', error);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
    window.addEventListener('reload', fetchData as EventListener);
    return () => window.removeEventListener('reload', fetchData as EventListener);
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
                <GlareImg
                  gid={greenId}
                  max={master}
                  useWide
                  useGreenscreenPosition
                  isBiColor={true}
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
          const deviceIdNum = Number(l.deviceId);
          if (!deviceIdNum) return null;
          const isRgb = l.icon === 'RGB';
          const mirrored = l.left > 802 / 2;
          let displayLabel = `#${deviceIdNum}`;
          if (l.showName) {
            const device = devices.find((d) => d.id === deviceIdNum);
            if (device) {
              displayLabel = device.name;
            }
          }
          if (l.label) {
            displayLabel = l.label;
          }
          const lampImageStyle = isRgb ? { transform: 'none' } : { transform: l.flip ? 'rotate(180deg) scaleX(-1)' : mirrored ? 'translate(-10px, -60px)' : 'translate(10px, -60px)' };
          return (
            <div key={l.uuid} className='studioOverviewLight' style={{ position: 'absolute', top: l.top + 30, left: l.left }}>
              <LampVisual
                gid={deviceIdNum}
                icon={l.icon}
                master={master}
                handleGlowAndFocus={handleGlowAndFocus}
                imgSrc={imgByIcon(l.icon)}
                label={displayLabel}
                mirrored={mirrored}
                flip={l.flip}
                useCustomPositioning={true}
                infoPanelClass='studioOverviewInfopanel studioOverviewInfopanelCustom'
                lampImageClass='studioOverviewCustomLamp'
                lampImageStyle={lampImageStyle}
              />
            </div>
          );
        })}
        {/* Grid Lights */}
        <div className='SettingsOverviewImageForeground'>
          <div
            className='SettingsOverviewImageGrid'
            style={{ gridTemplateRows: `repeat(${rows},1fr)`, gridTemplateColumns: `repeat(${cols},1fr)` }}
          >
            {Array.from({ length: rows }).flatMap((_, r) =>
              Array.from({ length: cols }).map((_, c) => {
                const cell = gridCfg.find((g) => g.row === r && g.col === c);
                if (!cell || !cell.id) return <div key={`${r}-${c}`} />;
                const cellIdNum = Number(cell.id);
                const right = c >= cols / 2;
                const center = cols % 2 === 1 && c === Math.floor(cols / 2);
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`studioOverviewLight`}
                    style={{ justifySelf: right ? 'flex-end' : center ? 'center' : 'flex-start' }}
                  >
                    <LampVisual
                      gid={cellIdNum}
                      icon={cell.icon}
                      master={master}
                      handleGlowAndFocus={handleGlowAndFocus}
                      imgSrc={imgByIcon(cell.icon)}
                      mirrored={right}
                      lampImageClass='studioOverviewLamp'
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Trusses */}
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
