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
 * @file Header.tsx
 */
import { useState, useEffect, useContext } from 'react';
import './Header.css';
import { Link, useLocation } from 'react-router-dom';
import { TranslationContext } from './TranslationContext';

function Header() {
  let location = useLocation();
  const { t } = useContext(TranslationContext);
  const [isDark, setIsDark] = useState(true);
  const [, forceRender] = useState(false); // Force rerender for show page setting

  // Load mode from local storage
  useEffect(() => {
    const storedIsDark = localStorage.getItem('isDark');
    if (storedIsDark !== null) setIsDark(storedIsDark === 'true');

    const defaultDesign = localStorage.getItem('defaultDesign') !== 'false';
    if (!defaultDesign) document.body.classList.add('defaultB');

    // Listen for changes to the show page setting
    const handleStorageChange = (event: CustomEvent<boolean>) => {
      if (event.type === 'showPage') forceRender((prev) => !prev);
    };
    window.addEventListener('showPage', handleStorageChange as EventListener);
    return () => window.removeEventListener('showPage', handleStorageChange as EventListener);
  }, []);

  // Set dark/light mode
  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('isDark', `${isDark}`);
    window.dispatchEvent(new CustomEvent<boolean>('designChange', { detail: isDark }));
  }, [isDark]);

  return (
    <div className='header'>
      <div className='containerHeader'>
        <ul className='unorderedList'>
          <li>
            <Link
              to='/Studio'
              className={location.pathname === '/' || location.pathname === '/Studio' ? 'is-active' : ''}
            >
              <div className='headerButton'>
                <svg
                  className='headerIcon'
                  xmlns='http://www.w3.org/2000/svg'
                  height='24'
                  viewBox='0 -960 960 960'
                  width='24'
                >
                  <path d='M360-280h160q17 0 28.5-11.5T560-320v-40l51 27q10 5 19.5-1t9.5-17v-98q0-11-9.5-17t-19.5-1l-51 27v-40q0-17-11.5-28.5T520-520H360q-17 0-28.5 11.5T320-480v160q0 17 11.5 28.5T360-280Zm-200 80v-360q0-19 8.5-36t23.5-28l240-180q21-16 48-16t48 16l240 180q15 11 23.5 28t8.5 36v360q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200Zm80 0h480v-360L480-740 240-560v360Zm240-270Z' />
                </svg>
                {t('studio')}
              </div>
            </Link>
          </li>
          <li>
            <Link
              to='/Control'
              className={location.pathname === '/Control' || location.state ? 'is-active' : ''}
            >
              <div className='headerButton'>
                <svg
                  className='headerIcon'
                  xmlns='http://www.w3.org/2000/svg'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                >
                  <path d='m19,20c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v4Zm-12,0c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-8c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29c.19.19.29.43.29.71v8Zm14-8c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71c.19-.19.43-.29.71-.29h1V4c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v7h1c.28,0,.52.1.71.29.19.19.29.43.29.71Zm-6,4c0,.28-.1.52-.29.71s-.43.29-.71.29h-1v3c0,.28-.1.52-.29.71-.19.19-.43.29-.71.29s-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71v-3h-1c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h4c.28,0,.52.1.71.29s.29.43.29.71Zm-2-4c0,.28-.1.52-.29.71s-.43.29-.71.29-.52-.1-.71-.29c-.19-.19-.29-.43-.29-.71V4c0-.28.1-.52.29-.71.19-.19.43-.29.71-.29s.52.1.71.29.29.43.29.71v8Zm-4-4c0,.28-.1.52-.29.71s-.43.29-.71.29h-4c-.28,0-.52-.1-.71-.29s-.29-.43-.29-.71.1-.52.29-.71.43-.29.71-.29h1v-3c0-.28.1-.52.29-.71s.43-.29.71-.29.52.1.71.29.29.43.29.71v3h1c.28,0,.52.1.71.29s.29.43.29.71Z' />
                </svg>
                {t('control')}
              </div>
            </Link>
          </li>
          <li>
            <Link
              to='/Scenes'
              className={location.pathname === '/Scenes' ? 'is-active' : ''}
            >
              <div className='headerButton'>
                <svg
                  className='headerIcon'
                  xmlns='http://www.w3.org/2000/svg'
                  height='24'
                  viewBox='0 -960 960 960'
                  width='24'
                >
                  <path d='M400-160 232-88q-40 17-76-6.5T120-161v-519q0-33 23.5-56.5T200-760h400q33 0 56.5 23.5T680-680v519q0 43-36 66.5T568-88l-168-72Zm0-88 200 86v-518H200v518l200-86Zm360 88v-680H240v-80h520q33 0 56.5 23.5T840-840v680h-80ZM400-680H200h400-200Z' />
                </svg>
                {t('scenes')}
              </div>
            </Link>
          </li>
          {localStorage.getItem('showPage') === 'true' && (
            <li>
              <Link
                to='/Show'
                className={location.pathname === '/Show' ? 'is-active' : ''}
              >
                <div className='headerButton'>
                  <svg
                    className='headerIcon'
                    xmlns='http://www.w3.org/2000/svg'
                    height='24'
                    viewBox='0 -960 960 960'
                    width='24'
                  >
                    <path d='M634-463q9-6 9-17t-9-17L411-640q-10-7-20.5-1T380-623v286q0 12 10.5 18t20.5-1l223-143ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm0-560v560-560Z' />
                  </svg>
                  {t('show')}
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
      <div className='divTheme'>
        <button
          onClick={() => setIsDark(!isDark)}
          className='buttonTheme'
        >
          {!isDark ? (
            <svg
              className='centerIcon'
              xmlns='http://www.w3.org/2000/svg'
              height='34'
              viewBox='0 -960 960 960'
              width='34'
            >
              <path d='M480-120q-150 0-255-105T120-480q0-135 79.5-229T408-830q41-8 56 14t-1 60q-9 23-14 47t-5 49q0 90 63 153t153 63q25 0 48.5-4.5T754-461q43-16 64 1.5t11 59.5q-27 121-121 200.5T480-120Zm0-60q109 0 190-67.5T771-406q-25 11-53.667 16.5Q688.667-384 660-384q-114.689 0-195.345-80.655Q384-545.311 384-660q0-24 5-51.5t18-62.5q-98 27-162.5 109.5T180-480q0 125 87.5 212.5T480-180Zm-4-297Z' />
            </svg>
          ) : (
            <svg
              className='centerIcon'
              xmlns='http://www.w3.org/2000/svg'
              height='31'
              viewBox='0 -960 960 960'
              width='31'
            >
              <path d='M479.765-340Q538-340 579-380.765q41-40.764 41-99Q620-538 579.235-579q-40.764-41-99-41Q422-620 381-579.235q-41 40.764-41 99Q340-422 380.765-381q40.764 41 99 41Zm.235 60q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM70-450q-12.75 0-21.375-8.675Q40-467.351 40-480.175 40-493 48.625-501.5T70-510h100q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T170-450H70Zm720 0q-12.75 0-21.375-8.675-8.625-8.676-8.625-21.5 0-12.825 8.625-21.325T790-510h100q12.75 0 21.375 8.675 8.625 8.676 8.625 21.5 0 12.825-8.625 21.325T890-450H790ZM479.825-760Q467-760 458.5-768.625T450-790v-100q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T510-890v100q0 12.75-8.675 21.375-8.676 8.625-21.5 8.625Zm0 720Q467-40 458.5-48.625T450-70v-100q0-12.75 8.675-21.375 8.676-8.625 21.5-8.625 12.825 0 21.325 8.625T510-170v100q0 12.75-8.675 21.375Q492.649-40 479.825-40ZM240-678l-57-56q-9-9-8.629-21.603.37-12.604 8.526-21.5 8.896-8.897 21.5-8.897Q217-786 226-777l56 57q8 9 8 21t-8 20.5q-8 8.5-20.5 8.5t-21.5-8Zm494 495-56-57q-8-9-8-21.375T678.5-282q8.5-9 20.5-9t21 9l57 56q9 9 8.629 21.603-.37 12.604-8.526 21.5-8.896 8.897-21.5 8.897Q743-174 734-183Zm-56-495q-9-9-9-21t9-21l56-57q9-9 21.603-8.629 12.604.37 21.5 8.526 8.897 8.896 8.897 21.5Q786-743 777-734l-57 56q-8 8-20.364 8-12.363 0-21.636-8ZM182.897-182.897q-8.897-8.896-8.897-21.5Q174-217 183-226l57-56q8.8-9 20.9-9 12.1 0 20.709 9Q291-273 291-261t-9 21l-56 57q-9 9-21.603 8.629-12.604-.37-21.5-8.526ZM480-480Z' />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default Header;
