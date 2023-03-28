import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App'
import './samples/node-api'
import './index.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')

/**
 * This code is a client-side entry point for a React application.
 * 
 * The code imports the following:
 *  - 'React' and 'ReactDOM' to render the application
 *  - The 'App' component from the 'components' directory
 *  - A script 'node-api' from the 'samples' directory, which is not shown in the code snippet
 *  - A SCSS file 'index.scss' to style the application
 * 
 * The code then calls 'ReactDOM.createRoot().render()' to render the 'App' component within the DOM element 
 * with the 'root' id. The 'React.StrictMode' component is also used to enable additional runtime checks for 
 * common React issues.
 * 
 * Finally, the code uses 'postMessage' to send a message to the parent window to remove a loading indicator. 
 * This indicates that the application has finished loading and is ready to be displayed.
 */