function domReady(condition: DocumentReadyState[] = ['complete', 'interactive']) {
  return new Promise((resolve) => {
    if (condition.includes(document.readyState)) {
      resolve(true);
    } else {
      document.addEventListener('readystatechange', () => {
        if (condition.includes(document.readyState)) {
          resolve(true);
        }
      });
    }
  });
}

const safeDOM = {
  append(parent: HTMLElement, child: HTMLElement) {
    if (!Array.from(parent.children).find((e) => e === child)) {
      return parent.appendChild(child);
    }
  },
  remove(parent: HTMLElement, child: HTMLElement) {
    if (Array.from(parent.children).find((e) => e === child)) {
      return parent.removeChild(child);
    }
  },
};

function useLoading() {
  const className = `loaders-css`;
  const styleContent = `
    .${className} > div {
      width: 256px;
      height: 256px;
      background: url('../src/assets/iconStartup.png') no-repeat center/cover;
      opacity: .6;
      display: flex;
      align-items: center;
      justify-content: center;
      filter: invert(100%);
    }
    .${className} > div > div {
      margin-bottom: 80px;
      width: 94px;
      height: 94px;
      background: url('../src/assets/iconReflection.png') no-repeat center/cover;
      animation: spin .8s infinite linear;
    }
    .app-loading-wrap {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #212121;
      z-index: 9;
    }
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
  `;
  const oStyle = document.createElement('style');
  const oDiv = document.createElement('div');

  oStyle.id = 'app-loading-style';
  oStyle.innerHTML = styleContent;
  oDiv.className = 'app-loading-wrap';
  oDiv.innerHTML = `<div class="${className}"><div><div></div></div></div>`;

  return {
    appendLoading() {
      safeDOM.append(document.head, oStyle);
      safeDOM.append(document.body, oDiv);
    },
    removeLoading() {
      safeDOM.remove(document.head, oStyle);
      safeDOM.remove(document.body, oDiv);
    },
  };
}

// ----------------------------------------------------------------------

const { appendLoading, removeLoading } = useLoading();
domReady().then(appendLoading);

window.onmessage = (ev) => {
  ev.data.payload === 'removeLoading' && removeLoading();
};

// ----------------------------------------------------------------------

const { ipcRenderer, contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getIp: async () => {
    return await ipcRenderer.invoke('get-ip');
  },
  send: (channel, data) => {
    let validChannels = ['toggle-full-screen', 'minimize'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  on: (channel, func) => {
    let validChannels = [];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  getPlatform: async () => {
    return await ipcRenderer.invoke('get-platform');
  },
  openExternal: (url) => {
    ipcRenderer.send('open-external', url);
  },
  getFullScreen: async () => {
    return await ipcRenderer.invoke('get-full-screen');
  },
});

setTimeout(removeLoading, 4999);
