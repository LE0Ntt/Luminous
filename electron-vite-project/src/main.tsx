/**
 * Main.tsx
 * @author Leon Hölzel
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './samples/node-api'
import './index.css'
import { ConnectionProvider } from "./components/ConnectionContext";
import { FaderProvider } from './components/FaderContext'

/* http://192.168.0.251:5000 */
/* http://192.168.178.195:5000 */
/* http://192.168.178.69:5000 */
/* http://127.0.0.1:5000 */

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  /*<React.StrictMode>*/
    <ConnectionProvider url="http://192.168.178.195:5000">
      <FaderProvider>
        <App />
      </FaderProvider>
    </ConnectionProvider>
  /*</React.StrictMode>,*/
)

postMessage({ payload: 'removeLoading' }, '*')
