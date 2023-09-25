import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'
import { update } from './update'
import Store from 'electron-store'

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer

process.env.DIST_ELECTRON = join(__dirname, '../')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
//if (release().startsWith('6.1')) app.disableHardwareAcceleration()
//app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

// Erlaubt nur eine Instanz laufen zu lassen
if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}


// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')


async function createWindow() {
  win = new BrowserWindow({
    title: 'Luminous',
    icon: join(process.env.PUBLIC, 'favicon.ico'),
    webPreferences: {
      preload,
      // Warning: Enable nodeIntegration and disable contextIsolation is not secure in production
      // Consider using contextBridge.exposeInMainWorld
      // Read more on https://www.electronjs.org/docs/latest/tutorial/context-isolation
      nodeIntegration: false,
      contextIsolation: true,
    },
    width: 1920,  //ändert Fenster breite
    height: 1080, //ändert Fenster höhe
    minWidth: 1024,  // Mindestbreite des Fensters
    minHeight: 618, // Mindesthöhe des Fensters
    titleBarStyle: 'hidden',
    frame: false,
  })

  //win.setFullScreen(true); // Startet das Fenster im Fullscreen

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.on('did-finish-load', () => {
      win?.webContents.openDevTools()
    })
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })

  // Apply electron-updater
  update(win)
}

app.whenReady().then(createWindow)

// win/linux quit app when all windows closed
app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

// mac stuff neues window soweit ich verstehe
app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// Minimize
ipcMain.on('minimize', () => {
  win.minimize()
})

// Toggle Fullscreen
ipcMain.on('toggle-full-screen', () => {
  if (win?.isFullScreen()) {
    win.setFullScreen(false);
  } else {
    win?.setFullScreen(true);
  }
})

// Store 
const schema = {
  ip: {
    type: 'string',
    format: 'ipv4',
    default: '127.0.0.1',
  },
};

const store = new Store({ schema } as any); // as any, weil sonst ein Fehler kommt

ipcMain.handle('get-ip', () => {
  const ip = store.get('ip');
  const port = '5000'; // Or get it from your config if it's dynamic.
  return { ip, port };
});

const ip = store.get('ip');

console.log(`Current IP: ${ip}`);

let currentIp = store.get('ip');

ipcMain.handle('get-platform', () => {
  return process.platform;
});
