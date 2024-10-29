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
import React, { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import './Settings.css';
import { TranslationContext } from './TranslationContext';
import { useConnectionContext } from './ConnectionContext';
import StudioOverviewImage from '@/assets/StudioOverview.png';
import Button from './Button';

interface Setting3Props {
  studioRows: number;
  studioColumns: number;
}

interface DeviceConfig {
  id: number;
  name: string;
  device_type: string;
}

const Setting3: React.FC<Setting3Props> = ({ studioRows, studioColumns }) => {
  const { t } = useContext(TranslationContext);

  const [inputStudioRows, setInputStudioRows] = useState<number>(studioRows);
  const [inputStudioColumns, setInputStudioColumns] = useState<number>(studioColumns);
  const [devices, setDevices] = useState<DeviceConfig[]>([]);
  const { url, connected, on, off } = useConnectionContext();

  const fetchDevices = async () => {
    try {
      const response = await fetch(url + '/fader');
      const data = await response.json();
      const parsedData: DeviceConfig[] = JSON.parse(data);
      parsedData.shift(); // Entferne Master
      setDevices(parsedData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleInputStudioRows = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputStudioRows(Math.max(1, Math.min(10, Number(e.target.value))));
  };

  const handleInputStudioColumns = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputStudioColumns(Math.max(1, Math.min(10, Number(e.target.value))));
  };

  const defaultGridValues = [
    { id: 5, row: 0, col: 0, type: 'spot' },
    { id: 5, row: 0, col: 1, type: 'fillLight' },
    { id: 6, row: 0, col: 2, type: 'fillLight' },
    { id: 6, row: 0, col: 3, type: 'spot' },
    { id: 4, row: 1, col: 0, type: 'fillLight' },
    { id: 4, row: 1, col: 1, type: 'fillLight' },
    { id: 7, row: 1, col: 2, type: 'fillLight' },
    { id: 7, row: 1, col: 3, type: 'fillLight' },
    { id: 3, row: 2, col: 0, type: 'spot' },
    { id: 3, row: 2, col: 1, type: 'fillLight' },
    { id: 8, row: 2, col: 2, type: 'fillLight' },
    { id: 8, row: 2, col: 3, type: 'spot' },
    { id: 2, row: 3, col: 0, type: 'spot' },
    { id: 2, row: 3, col: 1, type: 'spot' },
    { id: 9, row: 3, col: 2, type: 'fillLight' },
    { id: 9, row: 3, col: 3, type: 'spot' },
    { id: 1, row: 4, col: 0, type: 'spot' },
    { id: 1, row: 4, col: 1, type: 'fillLight' },
    { id: 10, row: 4, col: 3, type: 'spot' },
  ];

  const [gridValues, setGridValues] = useState(defaultGridValues);

  useEffect(() => {
    setGridValues((prevValues) => {
      return prevValues.filter((cell) => cell.row < inputStudioRows && cell.col < inputStudioColumns && cell.id !== null);
    });
  }, [inputStudioRows, inputStudioColumns]);

  const handleSelectChange = (rowIndex: number, colIndex: number, value: string, field: 'id' | 'type') => {
    setGridValues((prevValues) => {
      let newValues = [...prevValues];

      if (field === 'id') {
        if (!value) {
          newValues = prevValues.filter((cell) => !(cell.row === rowIndex && cell.col === colIndex));
        } else {
          const numericId = parseInt(value, 10);
          const existingCell = newValues.find((cell) => cell.row === rowIndex && cell.col === colIndex);

          if (existingCell) {
            existingCell.id = numericId;
            existingCell.type = existingCell.type || 'spot';
          } else {
            newValues.push({ id: numericId, row: rowIndex, col: colIndex, type: 'spot' });
          }
        }
      } else if (field === 'type') {
        newValues = prevValues.map((cell) => (cell.row === rowIndex && cell.col === colIndex ? { ...cell, type: value } : cell));
      }

      console.log(newValues);
      return newValues;
    });
  };

  const grid = useMemo(
    () =>
      Array.from({ length: inputStudioRows }, (_, rowIndex) =>
        Array.from({ length: inputStudioColumns }, (_, colIndex) => {
          const cell = gridValues.find((cell) => cell.row === rowIndex && cell.col === colIndex);
          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className='cell studioOverviewInfopanelTest'
              style={{ display: 'flex', flexDirection: 'column', margin: '0 5px' }}
            >
              <select
                value={cell && cell.id !== null ? cell.id : ''}
                onChange={(e) => handleSelectChange(rowIndex, colIndex, e.target.value, 'id')}
              >
                <option value=''>None</option>
                {devices.map((device) => (
                  <option
                    key={device.id}
                    value={device.id}
                  >
                    {device.name}
                  </option>
                ))}
              </select>
              <select
                value={cell ? cell.type : ''}
                onChange={(e) => handleSelectChange(rowIndex, colIndex, e.target.value, 'type')}
                disabled={!cell || cell.id === null}
              >
                <option value='spot'>Spot</option>
                <option value='fillLight'>Fill Light</option>
              </select>
            </div>
          );
        })
      ).flat(), // Flache Struktur, um alle Elemente in einem Array zu halten
    [devices, inputStudioRows, inputStudioColumns, gridValues]
  );

  const handleSave = async () => {
    console.log('Saving studio configuration');
    try {
      const response = await fetch(url + '/studio', {
        method: 'POST',
        body: JSON.stringify(gridValues),
      });

      if (response.ok) {
        console.log('Successfully saved studio configuration');
      } else {
        console.error('Failed to save studio configuration');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className='SettingsOption'>
      <div className='SettingsOverview'>
        <div className='SettingsOverviewButtons'>
          <div className='SettingsTitle SettingsTitleInner'>
            <span>{t('set_studio')}</span>
          </div>
          <hr style={{ marginTop: '45px' }} />
          <div className='SettingContainer'>
            <div className='SettingsSubTitle h-[100%]'>
              Rows:
              <input
                className='bg-gray-900'
                type='number'
                value={inputStudioRows}
                onChange={handleInputStudioRows}
                min='1'
                max='10'
              />
              Columns:
              <input
                className='bg-gray-900'
                type='number'
                value={inputStudioColumns}
                onChange={handleInputStudioColumns}
                min='1'
                max='10'
              />
            </div>
          </div>
          <Button
            className='SettingsButton controlButton'
            onClick={handleSave}
          >
            {t('as_save')}
          </Button>
        </div>
        <div className='SettingsOverviewImage window'>
          <div className='SettingsOverviewImageForeground'>
            <div
              className='grid-container'
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${inputStudioColumns}, 1fr)`,
              }}
            >
              {grid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Setting3;
