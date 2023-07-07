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

/* http://192.168.0.251:5000 */
/* http://192.168.178.195:5000 */
/* http://192.168.178.69:5000 */
/* http://127.0.0.1:5000 */

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  /*<React.StrictMode>*/
    <ConnectionProvider url="http://192.168.178.14:5000">
      <FaderProvider>
        <App />
      </FaderProvider>
    </ConnectionProvider>
  /*</React.StrictMode>,*/
)

postMessage({ payload: 'removeLoading' }, '*')
