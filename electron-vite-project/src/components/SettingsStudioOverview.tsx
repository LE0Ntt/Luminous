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

  /* basic state */
  const [rows, setRows] = useState(studioRows);
  const [cols, setCols] = useState(studioColumns);

  /* data-driven state */
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const [grid, setGrid] = useState<GridCell[]>([]);
  const [customLamps, setCustomLamps] = useState<CustomLamp[]>([]);
  const [traversen, setTraversen] = useState<TraverseLamp[]>(Array(7).fill({ groupId: 0 }));
  const [greenScreenId, setGreenScreenId] = useState<number | null>(null);

  /* UI helpers */
  const [saveAdmin, setSaveAdmin] = useState(false);
  const [saveTemporary, setSaveTemporary] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchDevices = useCallback(async () => {
    try {
      const res = await fetch(`${url}/fader`);
      if (!res.ok) throw new Error('Device fetch failed');
      // Der Server liefert hier ein JSON-Objekt mit einem String-Payload
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
      // Hier kann res.json() wieder ein String oder bereits geparstes Objekt sein
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
      const preview = document.querySelector('.SettingsOverviewImage') as HTMLElement;
      const overlay = preview?.querySelector('.SettingsOverviewImageForeground') as HTMLElement;
      if (!parent || !preview || !overlay) return;

      const scale = Math.min(parent.clientWidth / ORIG_W, parent.clientHeight / ORIG_H);

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

  const updateCustomLamp = (uuid: string, field: keyof CustomLamp, value: string | number | boolean) => setCustomLamps((prev) => prev.map((l) => (l.uuid === uuid ? { ...l, [field]: value } : l)));
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
  };

  const handleAdminPasswordConfirm = useCallback(
    async (ok: boolean) => {
      setSaveAdmin(false);
      if (ok) await performSave('save_studio_grid');
    },
    [grid, customLamps, traversen, greenScreenId, rows, cols]
  );

  const handleSave = () => (saveTemporary ? performSave('save_studio_grid_temp') : setSaveAdmin(true));

  const gridCells = useMemo(() => {
    return Array.from({ length: rows }, (_, r) =>
      Array.from({ length: cols }, (_, c) => {
        const cell = grid.find((x) => x.row === r && x.col === c);
        return (
          <div
            key={`${r}-${c}`}
            className='cell studioOverviewInfopanelTest'
            style={{ display: 'flex', flexDirection: 'column', margin: '0 4px' }}
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
    return customLamps.map((lamp) => (
      <div
        className={'studioOverviewInfopanelTest'}
        key={lamp.uuid}
        style={{ position: 'absolute', top: lamp.top, left: lamp.left, display: 'flex', flexDirection: 'column' }}
      >
        <select
          value={lamp.deviceId?.toString() ?? ''}
          onChange={(e) => updateCustomLamp(lamp.uuid, 'deviceId', Number(e.target.value))}
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
    ));
  }, [customLamps, devices]);

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
                <span className='relative top-[-6px]'>Grid Größe</span>
              </div>
              <label>
                <span className='overviewInput'>Rows:</span>
                <input
                  className='textBox overviewInput'
                  type='number'
                  min={1}
                  max={10}
                  value={rows}
                  onChange={(e) => setRows(clamp(Number(e.target.value), 1, 10))}
                />
              </label>
              <label>
                <span className='overviewInput'>Columns:</span>
                <input
                  className='textBox overviewInput'
                  type='number'
                  min={1}
                  max={10}
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
                <span className='relative top-[-6px]'>Traversen</span>
              </div>
              <div className='traverse-grid'>
                {traversen.map((tr, i) => (
                  <div
                    key={i}
                    className='traverse-cell'
                  >
                    <label>Traverse {i + 1} </label>
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
                className='SettingsButton controlButton buttonRight overviewButton'
                onClick={addCustomLamp}
              >
                Add Lamp
              </Button>
              <div className='customRowContainer'>
                {customLamps.map((lamp) => (
                  <div
                    key={lamp.uuid}
                    className='custom-row'
                  >
                    <input
                      className='textBox overviewInput'
                      type='number'
                      placeholder='X(px)'
                      value={lamp.left}
                      onChange={(e) => updateCustomLamp(lamp.uuid, 'left', Number(e.target.value))}
                    />
                    <input
                      className='textBox overviewInput'
                      type='number'
                      placeholder='Y(px)'
                      value={lamp.top}
                      onChange={(e) => updateCustomLamp(lamp.uuid, 'top', Number(e.target.value))}
                    />
                    <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      Flip
                      <input
                        type='checkbox'
                        checked={lamp.flip}
                        onChange={(e) => updateCustomLamp(lamp.uuid, 'flip', e.target.checked)}
                      />
                    </label>
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
            <div className='SettingContainer'>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  type='checkbox'
                  checked={saveTemporary}
                  onChange={(e) => setSaveTemporary(e.target.checked)}
                />
                {t('as_save_temp')}
              </label>
              <Button
                className='SettingsButton controlButton overviewButton'
                onClick={handleSave}
              >
                {t('as_save')}
              </Button>
              {statusMsg && <p style={{ marginTop: 10 }}>{statusMsg}</p>}
            </div>
          </div>
          {/* right column – preview */}
          <div className='SettingsOverviewImage window'>
            <div
              className='SettingsOverviewImageForeground'
              style={{ position: 'relative' }}
            >
              <div
                className='grid-container'
                style={{ display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)` }}
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
