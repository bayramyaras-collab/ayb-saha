const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('aybPC', {
  platform: 'windows',
  pencere: (action) => ipcRenderer.send('by-window-action', action),
  openUrl: (url) => ipcRenderer.send('by-open-url', url)
});
