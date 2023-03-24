import nodeLogo from './assets/node.svg'
import { useState } from 'react'
import Update from '@/components/update'
import './App.css'
//new
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Test from './Test1'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className='App'>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/Test1' element={<Test />} />
        </Routes>
      </Router>
      {/** 
      <div>
        <a href='https://github.com/electron-vite/electron-vite-react' target='_blank'>
          <img src='./electron-vite.svg' className='logo' alt='Electron + Vite logo' />
        </a>
      </div>
      <h1>Electron + Vite + React</h1>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p className='m-2'>
          Edit <code>src/components/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className='read-the-docs'>
        Click on the Electron + Vite logo to learn more
      </p>
      <div className='flex-center'>
        Place static files into the<code>/public</code> folder <img style={{ width: '5em' }} src={nodeLogo} alt='Node logo' />
      </div>

      <Update />
      */}
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