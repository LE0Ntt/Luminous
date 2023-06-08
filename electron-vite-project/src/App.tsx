/**
 * App.tsx
 * @author Leon Hölzel
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './index.css'
import Studio from './Studio'
import Header from './components/Header'
import Show from './Show'
import Control from './Control'
import Scenes from './Scenes'
import { TranslationProvider } from "./components/TranslationContext";
import translations from "./translations.json";
import Titlebar from './components/Titlebar';
import React, { useRef, useContext, useEffect, useState } from "react";

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [contentScale, setContentScale] = useState(1);

  const updateContentScale = () => {
    if (mainContentRef.current) {
      const containerWidth = mainContentRef.current.offsetWidth;
      const containerHeight = mainContentRef.current.offsetHeight;

      const contentWidth = 1920;
      const contentHeight = 990;

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
};

export default App;

/**
 * This is a React functional component named 'App'. It imports an SVG file ('nodeLogo') and the 'useState' hook from React. 
 * It also imports an 'Update' component from a file in the 'components' directory and a SCSS file named 'App.scss'.
 * 
 * In the function body, it sets up a state variable 'count' using the 'useState' hook and initializes it to 0.
 * 
 * The component returns JSX, which renders an '<a>' tag with an '<img>' tag inside it, a '<h1>' tag, a '<div>' tag with a 
 * class of 'card', a '<button>' tag that updates the 'count' state on click, a '<p>' tag with a class of 'read-the-docs', 
 * another '<div>' tag with a class of 'flex-center' and an '<img>' tag inside it, and finally an instance of the 'Update' 
 * component.
 * 
 * The component also includes some inline styling in the 'img' tag using the 'style' attribute, and refers to the imported 
 * 'nodeLogo' and 'Update' components in the JSX code.
 */