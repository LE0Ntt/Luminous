/**
 * App.tsx
 * @author Leon Hölzel
 */
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import './index.css'
import Studio from './Studio'
import Header from './components/Header'
import Show from './Show'
import Control from './Control'
import Scenes from './Scenes'
import { TranslationProvider } from "./TranslationContext";
import translations from "./translations.json";

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  return (
    <div className='App relative background'>
      <div className='titlebar h-[30px] w-full'></div>
      <Router>
      {/* draußen, weil maybe nicht benötigt
      <div className='titlebar fixed top-0 left-0 w-full'>*/}
      <Header/>
      {/*</div>*/}
      <TranslationProvider translations={translations} defaultLanguage="en">
        <Routes>
          <Route path="/" element={<Studio />} />
          <Route path="/Studio" element={<Studio />} />
          <Route path='/Control' element={<Control />} />
          <Route path='/Scenes' element={<Scenes />} />
          <Route path='/Show' element={<Show />} />
        </Routes>
        </TranslationProvider>
      </Router>
    </div>
  )
}

export default App

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