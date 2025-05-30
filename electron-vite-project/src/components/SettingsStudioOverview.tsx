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
 * @file SettingsStudioOverview.tsx
 */
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './Settings.css';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import Button from './Button';
import AdminPassword from './AdminPassword';
import Toggle from './Toggle';

export type DeviceType = 'RGBDim' | 'BiColor' | 'Spot' | 'Fill' | 'HMI' | 'Misc';
export type IconType = 'RGB' | 'LED' | 'Spot' | 'Fill' | 'None';

interface SettingProps {
  studioRows: number;
  studioColumns: number;
}

interface DeviceConfig {
  id: number;
  name: string;
  device_type: DeviceType;
}

interface GridCell {
  id: number | null;
  row: number;
  col: number;
  icon: IconType;
}

interface CustomLamp {
  uuid: string;
  deviceId: number | null;
  icon: IconType;
  left: number;
  top: number;
  flip: boolean;
  showName?: boolean;
}

interface TraverseLamp {
  groupId: number;
}

const ICON_BY_DEVICE: Record<DeviceType, IconType> = {
  RGBDim: 'RGB',
  BiColor: 'LED',
  Spot: 'Spot',
  Fill: 'Fill',
  HMI: 'Spot',
  Misc: 'Spot',
};

const ICON_OPTIONS: IconType[] = ['RGB', 'LED', 'Spot', 'Fill', 'None'];

const SettingsStudioOverview: React.FC<SettingProps> = ({ studioRows, studioColumns }) => {
  const { t } = useContext(TranslationContext);
  const { url } = useConnectionContext();
  const [rows, setRows] = useState(studioRows);
  const [cols, setCols] = useState(studioColumns);
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [customLamps, setCustomLamps] = useState<CustomLamp[]>([]);
  const [traversen, setTraversen] = useState<TraverseLamp[]>(Array(7).fill({ groupId: 0 }));
  const [greenScreenId, setGreenScreenId] = useState<number | null>(null);
  const [saveAdmin, setSaveAdmin] = useState(false);
  const [saveTemporary, setSaveTemporary] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const previewRef = React.useRef<HTMLDivElement>(null);
  const scaleRef = React.useRef<number>(1);
  const draggingUUIDRef = React.useRef<string | null>(null);
  const dragOffsetRef = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [highlightedLampUUID, setHighlightedLampUUID] = useState<string | null>(null);
  const settingsRowRefs = React.useRef<Record<string, HTMLDivElement>>({});

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${url}/fader`);
      if (!res.ok) throw new Error('Device fetch failed');
      const raw = await res.json();
      const arr: DeviceConfig[] = typeof raw === 'string' ? JSON.parse(raw) : raw;
      arr.shift();
      setDevices(arr);
    } catch (err) {
      console.error(err);
    }
  }, [url]);

  const fetchStudioGrid = useCallback(async () => {
    try {
      const res = await fetch(`${url}/studio_grid`);
      if (!res.ok) throw new Error('Grid fetch failed');
      const raw = await res.json();
      const data: any = typeof raw === 'string' ? JSON.parse(raw) : raw;

      /* grid */
      setGrid(
        (data.grid ?? []).map((c: any) => ({
          row: Number(c.row),
          col: Number(c.col),
          id: c.id != null ? Number(c.id) : null,
          icon: (c.icon as IconType) ?? 'None',
        }))
      );

      /* custom lamps */
      setCustomLamps(
        (data.custom ?? []).map((l: any) => ({
          uuid: l.uuid ?? crypto.randomUUID(),
          deviceId: l.deviceId != null ? Number(l.deviceId) : null,
          icon: (l.icon as IconType) ?? 'None',
          left: Number(l.left ?? 0),
          top: Number(l.top ?? 0),
          flip: !!l.flip,
          showName: !!l.showName,
        }))
      );

      /* traversen & greenscreen */
      if (Array.isArray(data.traversen)) {
        setTraversen(data.traversen.map((t: any) => ({ groupId: Number(t.groupId) })));
      }
      setGreenScreenId(data.greenScreenId != null ? Number(data.greenScreenId) : null);

      /* dimensions */
      setRows(Number(data.meta?.rows ?? studioRows));
      setCols(Number(data.meta?.cols ?? studioColumns));
    } catch (err) {
      console.error(err);
    }
  }, [url, studioRows, studioColumns]);

  useEffect(() => {
    fetchDevices();
    fetchStudioGrid();
  }, [fetchDevices, fetchStudioGrid]);

  // Scale the preview image to fit the window size
  useEffect(() => {
    const ORIG_W = 802;
    const ORIG_H = 868;

    const handleResize = () => {
      const parent = document.querySelector('.SettingsOverview') as HTMLElement;
      const preview = previewRef.current;
      const overlay = preview?.querySelector('.SettingsOverviewImageForeground') as HTMLElement;
      if (!parent || !preview || !overlay) return;
      const scale = Math.min(parent.clientWidth / ORIG_W, parent.clientHeight / ORIG_H);
      scaleRef.current = scale;
      preview.style.flexBasis = `${ORIG_W * scale}px`;
      preview.style.height = `${ORIG_H * scale}px`;
      overlay.style.width = `${ORIG_W}px`;
      overlay.style.height = `${ORIG_H}px`;
      overlay.style.transform = `scale(${scale})`;
      overlay.style.transformOrigin = 'top left';
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to the highlighted lamp 
  useEffect(() => {
    if (highlightedLampUUID && settingsRowRefs.current[highlightedLampUUID]) {
      settingsRowRefs.current[highlightedLampUUID].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [highlightedLampUUID]);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const updateGridCell = (row: number, col: number, field: keyof Pick<GridCell, 'id' | 'icon'>, value: string) => {
    setGrid((prev) => {
      const list = [...prev];
      const idx = list.findIndex((c) => c.row === row && c.col === col);
      if (idx === -1) list.push({ row, col, id: null, icon: 'None' });
      const cell = list.find((c) => c.row === row && c.col === col)!;

      if (field === 'id') {
        if (!value) return list.filter((c) => !(c.row === row && c.col === col));
        cell.id = Number(value);
        const dev = devices.find((d) => d.id === cell.id);
        cell.icon = dev ? ICON_BY_DEVICE[dev.device_type] : 'None';
      } else if (field === 'icon') {
        cell.icon = value as IconType;
      }
      return list;
    });
  };

  const addCustomLamp = () => {
    setCustomLamps((prev) => [
      ...prev,
      {
        uuid: crypto.randomUUID(),
        deviceId: null,
        icon: 'None',
        left: 0,
        top: 0,
        flip: false,
      },
    ]);
  };

  const updateCustomLamp = (uuid: string, field: keyof CustomLamp, value: string | number | boolean) => {
    setCustomLamps((prev) =>
      prev.map((l) => {
        if (l.uuid === uuid) {
          const updatedLamp = { ...l, [field]: value };
          if (field === 'deviceId') {
            const newDeviceId = Number(value);
            if (newDeviceId) {
              const dev = devices.find((d) => d.id === newDeviceId);
              updatedLamp.icon = dev ? ICON_BY_DEVICE[dev.device_type] : 'None';
            } else {
              updatedLamp.icon = 'None';
            }
          } else if (field === 'icon') {
            updatedLamp.icon = value as IconType;
          } else if (field === 'flip') {
            updatedLamp.flip = !!value;
          } else if (field === 'left' || field === 'top') {
            updatedLamp[field] = Number(value);
          }
          if (field === 'showName') {
            updatedLamp.showName = !!value;
          }
          return updatedLamp;
        }
        return l;
      })
    );
  };

  const removeCustomLamp = (uuid: string) => setCustomLamps((prev) => prev.filter((l) => l.uuid !== uuid));

  const performSave = async (endpoint: string) => {
    const payload = {
      meta: { rows, cols },
      grid,
      custom: customLamps,
      greenScreenId,
      traversen,
    };
    try {
      const res = await fetch(`${url}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      setStatusMsg(t('saved_successfully'));
    } catch (err) {
      console.error(err);
      setStatusMsg(t('save_failed'));
    }

    // emit event to reload the studio grid
    window.dispatchEvent(new Event('reload'));
  };

  const handleAdminPasswordConfirm = useCallback(
    async (ok: boolean) => {
      setSaveAdmin(false);
      if (ok) await performSave('save_studio_grid');
    },
    [grid, customLamps, traversen, greenScreenId, rows, cols]
  );

  const handleSave = () => (saveTemporary ? performSave('save_studio_grid_temp') : setSaveAdmin(true));

  const rgbDimDevices = useMemo(() => devices.filter((d) => d.device_type === 'RGBDim'), [devices]);

  const gridCells = useMemo(() => {
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const cell = grid.find((x) => x.row === r && x.col === c);
        const right = c >= cols / 2;
        const center = cols % 2 === 1 && c === Math.floor(cols / 2);
        return (
          <div
            key={`${r}-${c}`}
            className='studioOverviewInfopanelTest'
            style={{ justifySelf: right ? 'flex-end' : center ? 'center' : 'flex-start' }}
          >
            <select
              value={cell?.id?.toString() ?? ''}
              onChange={(e) => updateGridCell(r, c, 'id', e.target.value)}
            >
              <option value=''>None</option>
              {devices.map((d) => (
                <option
                  key={d.id}
                  value={d.id.toString()}
                >
                  {d.name}
                </option>
              ))}
            </select>
            <select
              value={cell?.icon ?? 'None'}
              onChange={(e) => updateGridCell(r, c, 'icon', e.target.value)}
              disabled={!cell}
            >
              {ICON_OPTIONS.map((ico) => (
                <option
                  key={ico}
                  value={ico}
                >
                  {ico}
                </option>
              ))}
            </select>
          </div>
        );
      })
    ).flat();
  }, [rows, cols, grid, devices]);

  const customLampOverlays = useMemo(() => {
    const handleMouseDown = (e: React.MouseEvent, lamp: CustomLamp) => {
      e.preventDefault();
      draggingUUIDRef.current = lamp.uuid;
      const previewRect = previewRef.current?.getBoundingClientRect();
      const scale = scaleRef.current;
      if (!previewRect || scale === 0) return;
      dragOffsetRef.current = {
        x: (e.clientX - previewRect.left) / scale - lamp.left,
        y: (e.clientY - previewRect.top) / scale - lamp.top,
      };
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mouseleave', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingUUIDRef.current) return;
      const previewRect = previewRef.current?.getBoundingClientRect();
      const scale = scaleRef.current;
      if (!previewRect || scale === 0) return;
      const newLeft = (e.clientX - previewRect.left) / scale - dragOffsetRef.current.x;
      const newTop = (e.clientY - previewRect.top) / scale - dragOffsetRef.current.y;
      updateCustomLamp(draggingUUIDRef.current, 'left', Math.round(newLeft));
      updateCustomLamp(draggingUUIDRef.current, 'top', Math.round(newTop));
    };

    const handleMouseUp = () => {
      if (!draggingUUIDRef.current) return;
      draggingUUIDRef.current = null;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseleave', handleMouseUp);
    };

    return customLamps.map((lamp) => (
      <div
        key={lamp.uuid}
        className='studioOverviewInfopanelTest'
        style={{
          position: 'absolute',
          top: lamp.top + 5,
          left: lamp.left,
          cursor: draggingUUIDRef.current === lamp.uuid ? 'grabbing' : 'default',
        }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('select')) {
            return;
          }
          if ((e.target as HTMLElement).closest('.drag-handle')) {
            e.stopPropagation();
            return;
          }
        }}
      >
        <select
          value={lamp.deviceId?.toString() ?? ''}
          onChange={(e) => updateCustomLamp(lamp.uuid, 'deviceId', e.target.value)}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <option value=''>None</option>
          {devices.map((d) => (
            <option
              key={d.id}
              value={d.id.toString()}
            >
              {d.name}
            </option>
          ))}
        </select>
        <select
          value={lamp.icon}
          onChange={(e) => updateCustomLamp(lamp.uuid, 'icon', e.target.value)}
          disabled={!lamp.deviceId}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {ICON_OPTIONS.map((ico) => (
            <option
              key={ico}
              value={ico}
            >
              {ico}
            </option>
          ))}
        </select>
        <div
          style={{
            cursor: 'grab',
            fontSize: 23,
            position: 'absolute',
            right: -35,
            top: -1,
            width: 25,
            height: 25,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setHighlightedLampUUID(lamp.uuid);
            handleMouseDown(e, lamp);
            setTimeout(() => setHighlightedLampUUID(null), 700);
          }}
          title='Drag'
          className='studioOverviewInfopanelTest'
        >
          <span style={{ position: 'relative', top: '-7px', left: '3px' }}>≡</span>
        </div>
      </div>
    ));
  }, [customLamps, devices, updateCustomLamp, t]);

  function handleToggleChange(uuid: string): (checked: boolean) => void {
    return (checked: boolean) => {
      updateCustomLamp(uuid, 'showName', checked);
    };
  }

  return (
    <>
      {saveAdmin && (
        <AdminPassword
          onConfirm={handleAdminPasswordConfirm}
          onClose={() => setSaveAdmin(false)}
        />
      )}
      <div className='SettingsOption'>
        <div className='SettingsOverview'>
          {/* left column – controls */}
          <div className='SettingsOverviewButtons'>
            <div className='SettingsTitle SettingsTitleInner'>
              <span>{t('set_studio')}</span>
            </div>
            <hr style={{ marginTop: 45 }} />
            {/* grid size */}
            <div className='SettingContainer'>
              <div className='SettingsSubTitle'>
                <span className='relative top-[-6px]'>{t('set_gridSize')}</span>
              </div>
              <label>
                <span className='overviewInput'>{t('set_rows')}:</span>
                <input
                  className='textBox overviewInput'
                  type='number'
                  min={1}
                  max={8}
                  value={rows}
                  onChange={(e) => setRows(clamp(Number(e.target.value), 1, 10))}
                />
              </label>
              <label>
                <span className='overviewInput'>{t('set_columns')}:</span>
                <input
                  className='textBox overviewInput'
                  type='number'
                  min={1}
                  max={6}
                  value={cols}
                  onChange={(e) => setCols(clamp(Number(e.target.value), 1, 10))}
                />
              </label>
            </div>
            <hr />
            {/* greenscreen */}
            <div className='SettingContainer'>
              <div className='SettingsSubTitle'>
                <span className='relative top-[-6px]'>Greenscreen</span>
              </div>
              <select
                value={greenScreenId ?? ''}
                className='textBox'
                onChange={(e) => setGreenScreenId(Number(e.target.value))}
              >
                <option value=''>None</option>
                {devices.map((d) => (
                  <option
                    key={d.id}
                    value={d.id.toString()}
                  >
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <hr />
            {/* traversen */}
            <div className='SettingContainer traverseContainer'>
              <div className='SettingsSubTitle'>
                <span className='relative top-[-6px]'>{t('set_trusses')}</span>
              </div>
              <div className='traverseGrid'>
                {traversen.map((tr, i) => (
                  <div
                    key={i}
                    className='traverseCell'
                  >
                    <label>
                      {t('set_truss')} {i + 1}{' '}
                    </label>
                    <select
                      className='textBox'
                      value={tr.groupId ? tr.groupId.toString() : ''}
                      onChange={(e) => {
                        const gid = Number(e.target.value);
                        setTraversen((prev) => {
                          const arr = [...prev];
                          arr[i] = { groupId: gid };
                          return arr;
                        });
                      }}
                    >
                      <option value=''>None</option>
                      {rgbDimDevices.map((d) => (
                        <option
                          key={d.id}
                          value={d.id.toString()}
                        >
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <hr />
            {/* custom lamps */}
            <div className='SettingContainer customLampContainer'>
              <div className='SettingsSubTitle'>
                <span className='relative top-[-6px]'>{t('custom_lamps')}</span>
              </div>
              <Button
                className='SettingsButton controlButton danger'
                onClick={addCustomLamp}
              >
                <div className='removeIcon'>✕</div>
              </Button>
              <div className='customRowContainer'>
                {customLamps.map((lamp) => (
                  <div
                    key={lamp.uuid}
                    ref={(el) => {
                      if (el) settingsRowRefs.current[lamp.uuid] = el;
                      else delete settingsRowRefs.current[lamp.uuid];
                    }}
                    className={`customRow ${lamp.uuid === highlightedLampUUID ? 'faderGlow' : ''}`}
                  >
                    <label>X:</label>
                    <input
                      className='textBox overviewInput'
                      type='number'
                      placeholder='X(px)'
                      value={lamp.left}
                      onChange={(e) => updateCustomLamp(lamp.uuid, 'left', Number(e.target.value))}
                    />
                    <label>Y:</label>
                    <input
                      className='textBox overviewInput'
                      type='number'
                      placeholder='Y(px)'
                      value={lamp.top}
                      onChange={(e) => updateCustomLamp(lamp.uuid, 'top', Number(e.target.value))}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <input
                        type='checkbox'
                        checked={lamp.flip}
                        onChange={(e) => updateCustomLamp(lamp.uuid, 'flip', e.target.checked)}
                      />
                      Flip
                    </label>
                    <div className='toggleContainerSettings'>
                      <span>ID</span>
                      <Toggle
                        onClick={handleToggleChange(lamp.uuid)}
                        enabled={!!lamp.showName}
                      />
                      <span className='textRight'>Name</span>
                    </div>
                    <Button
                      className='SettingsButton controlButton danger'
                      onClick={() => removeCustomLamp(lamp.uuid)}
                    >
                      ✕
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <hr />
            {/* save */}
            <div
              className='SettingContainer'
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <label style={{ display: 'flex', gap: 4 }}>
                <input
                  type='checkbox'
                  checked={saveTemporary}
                  onChange={(e) => setSaveTemporary(e.target.checked)}
                />
                {t('set_save_temp')}
              </label>
              <Button
                className='SettingsButton controlButton overviewButton'
                onClick={handleSave}
              >
                {t('as_save')}
              </Button>
              {statusMsg && <p>{statusMsg}</p>}
            </div>
          </div>
          {/* right column – preview */}
          <div
            ref={previewRef}
            className='SettingsOverviewImage window'
          >
            <div className='SettingsOverviewImageForeground'>
              <div
                className='SettingsOverviewImageGrid'
                style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gridTemplateRows: `repeat(${rows},1fr)` }}
              >
                {gridCells}
              </div>
              {customLampOverlays}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsStudioOverview;
