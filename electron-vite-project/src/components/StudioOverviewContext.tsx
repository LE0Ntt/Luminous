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
 * @file TranslationContext.tsx
 */

import { createContext, useContext, useState } from 'react';
import spot from '../assets/SpotTop.png';
import biColor from '../assets/BiColorTop.png';
import fillLight from '../assets/FillTop.png';

interface StudioOverviewProviderProps {
  children: React.ReactNode;
}

interface StudioOverviewContextType {
  studioRows: number;
  setStudioRows: React.Dispatch<React.SetStateAction<number>>;
  studioColumns: number;
  setStudioColumns: React.Dispatch<React.SetStateAction<number>>;
  selectedSliders: { id: number; row: number; col: number; fake: boolean; type: string }[];
  setSelectedSliders: React.Dispatch<React.SetStateAction<{ id: number; row: number; col: number; fake: boolean; type: string }[]>>;
}

const StudioOverviewContext = createContext<StudioOverviewContextType | undefined>(undefined);

export const useStudioOverview = () => useContext(StudioOverviewContext);

export const StudioOverviewProvider: React.FC<StudioOverviewProviderProps> = ({ children }) => {
  const [studioRows, setStudioRows] = useState(6);
  const [studioColumns, setStudioColumns] = useState(4);

  const [selectedSliders, setSelectedSliders] = useState([
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
  ]);

  return (
    <StudioOverviewContext.Provider
      value={{
        studioRows,
        setStudioRows,
        studioColumns,
        setStudioColumns,
        selectedSliders,
        setSelectedSliders,
      }}
    >
      {children}
    </StudioOverviewContext.Provider>
  );
};
