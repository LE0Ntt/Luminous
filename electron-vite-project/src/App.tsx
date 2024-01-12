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
 * @file App.tsx
 */
import { useRef, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import Studio from './Studio';
import Header from './components/Header';
import Show from './Show';
import Control from './Control';
import Scenes from './Scenes';
import { TranslationProvider } from './components/TranslationContext';
import translations from './translations.json';
import Titlebar from './components/Titlebar';
import NoConnection from './components/NoConnection';
import { useConnectionContext } from './components/ConnectionContext';

function App() {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);
  const { connected } = useConnectionContext();
  const [firstRender, setFirstRender] = useState(true);

  // Start with dark mode
  if (firstRender) document.body.classList.toggle('dark', true);

  // To scale the content when the window is resized
  const updateContentScale = () => {
    if (mainContentRef.current) {
      const containerWidth = mainContentRef.current.offsetWidth;
      const containerHeight = mainContentRef.current.offsetHeight;

      const contentWidth = 1920;
      const contentHeight = 990; /* window-height - header */

      const widthScale = containerWidth / contentWidth;
      const heightScale = containerHeight / contentHeight;

      setContentScale(Math.min(widthScale, heightScale));
    }
  };

  useEffect(() => {
    if (firstRender) setFirstRender(false);

    updateContentScale();
    window.addEventListener('resize', updateContentScale);
    return () => window.removeEventListener('resize', updateContentScale);
  }, []);

  return (
    <div className='App relative background'>
      <TranslationProvider translations={translations}>
        <Router>
          <header style={{ height: '90px' }}>
            <Titlebar />
            <Header />
          </header>
          <div
            className='mainContainer'
            ref={mainContentRef}
          >
            <div style={{ transform: `scale(${contentScale})` }}>
              <div className='mainContent'>
                {!connected ? (
                  <>
                    <NoConnection />
                    <Routes>
                      <Route
                        path='/'
                        element={<Studio />}
                      />
                      <Route
                        path='/Studio'
                        element={<Studio />}
                      />
                      <Route
                        path='/Control'
                        element={<Control />}
                      />
                      <Route
                        path='/Scenes'
                        element={<Scenes />}
                      />
                      <Route
                        path='/Show'
                        element={<Show />}
                      />
                    </Routes>
                  </>
                ) : (
                  <Routes>
                    <Route
                      path='/'
                      element={<Studio />}
                    />
                    <Route
                      path='/Studio'
                      element={<Studio />}
                    />
                    <Route
                      path='/Control'
                      element={<Control />}
                    />
                    <Route
                      path='/Scenes'
                      element={<Scenes />}
                    />
                    <Route
                      path='/Show'
                      element={<Show />}
                    />
                  </Routes>
                )}
              </div>
            </div>
          </div>
        </Router>
      </TranslationProvider>
    </div>
  );
}

export default App;
