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
 * @file main.tsx
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './index.css'
import { ConnectionProvider } from "./components/ConnectionContext";
import { FaderProvider } from './components/FaderContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <ConnectionProvider url="http://192.168.2.199:5000">
      <FaderProvider>
        <App />
      </FaderProvider>
    </ConnectionProvider>
)

postMessage({ payload: 'removeLoading' }, '*')
