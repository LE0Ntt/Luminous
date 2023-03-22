import { lstat } from 'node:fs/promises'
import { cwd } from 'node:process'
import { ipcRenderer } from 'electron'

ipcRenderer.on('main-process-message', (_event, ...args) => {
  console.log('[Receive Main-process message]:', ...args)
})

lstat(cwd()).then(stats => {
  console.log('[fs.lstat]', stats)
}).catch(err => {
  console.error(err)
})

/**
 * This code imports the 'lstat' function from the built-in Node.js 'fs/promises' module, which provides 
 * a way to asynchronously check the status of a file. It also imports the 'cwd' function from the built-in 
 * 'process' module, which returns the current working directory.
 * 
 * The code then imports the 'ipcRenderer' object from the Electron module, which is used to communicate 
 * between the main and renderer processes in an Electron application.
 * 
 * The code sets up an event listener using the 'ipcRenderer.on()' method, which listens for a message 
 * from the main process with the channel name 'main-process-message'. When the event is received, the 
 * code logs the received message to the console.
 * 
 * Finally, the code uses the 'lstat' function to get the status of the current working directory using 
 * the 'cwd()' function. If the operation is successful, the code logs the resulting stats to the console. 
 * If an error occurs, the code logs the error to the console.
 */