/**
 * App.tsx
 * @author Leon Hölzel
 */
import { useRef, useEffect, useState } from "react";
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Studio from './Studio'
import Header from './components/Header'
import Show from './Show'
import Control from './Control'
import Scenes from './Scenes'
import { TranslationProvider } from "./components/TranslationContext";
import translations from "./translations.json";
import Titlebar from './components/Titlebar';

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);

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
    updateContentScale();
    window.addEventListener('resize', updateContentScale);
    return () => {
      window.removeEventListener('resize', updateContentScale);
    };
  }, []);

  return (
    <div className="App relative background">
      <TranslationProvider translations={translations} defaultLanguage="de">
        <Router>
          <header style={{ height: "90px" }}>
            <Titlebar />
            <Header />
          </header>
          <div className="mainContainer" ref={mainContentRef}>
            <div style={{ transform: `scale(${contentScale})` }}>
              <div className="mainContent" >
                <Routes>
                  <Route path="/" element={<Studio />} />
                  <Route path="/Studio" element={<Studio />} />
                  <Route path="/Control" element={<Control />} />
                  <Route path="/Scenes" element={<Scenes />} />
                  <Route path="/Show" element={<Show />} />
                </Routes>
              </div>
            </div>
          </div>
        </Router>
      </TranslationProvider>
    </div>
  );
}

export default App;