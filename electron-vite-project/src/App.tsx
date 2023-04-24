import './App.css'
//new
import Navbar from './components/Navbar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './Home'
import Test from './Test1'

console.log('[App.tsx]', `Hello world from Electron ${process.versions.electron}!`)

function App() {
  return (
    <div className='App relative'>
      <div className='titlebar fixed top-0 left-0 w-full'>
      </div>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path='/Test1' element={<Test />} />
        </Routes>
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