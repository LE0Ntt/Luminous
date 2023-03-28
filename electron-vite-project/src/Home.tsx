import React from 'react'
import nodeLogo from './assets/node.svg'
import { useState } from 'react'
import Update from '@/components/update'
import './App.css'
import './index.css'

const Home = () => {
    const [count, setCount] = useState(0)

  return (
    <div>
        <div className='bg-orange-300'>
        <a>
          test
          <img src='./electron-vite.svg' className='logo' alt='Electron + Vite logo' />
        </a>
        hier noch mehr text
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
    </div>
  )
}

export default Home