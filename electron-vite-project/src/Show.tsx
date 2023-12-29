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
 * @file Show.tsx
 */
import { useConnectionContext } from './components/ConnectionContext';
import './Show.css';
import Fader from './components/Fader';
import ScenesComponent from './components/ScenesComponent';
import Timeline from './components/Timeline';
import { useFaderContext } from './components/FaderContext';

function Show() {
  const { emit, on } = useConnectionContext();
  const { isDragging, setIsDragging } = useFaderContext();

  return (
    <>
      <div className='window showScenes'>
        <ScenesComponent sideId={2} />
      </div>
      <div className='window showSaves'></div>
      <div className='window showControls'>
        <div className='showControlButtons innerWindow'></div>
        <div className='showControlTimeline innerWindow'>
          <Timeline />
        </div>
        <div className='showControlMaster innerWindow'>
          <div className='showMasterAlign'>
            <Fader
              height={290}
              sliderGroupId={0}
              id={0}
              name='Value'
              className='noBorder'
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Show;
