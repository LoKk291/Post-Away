const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readFolder: (folderPath) => ipcRenderer.invoke('read-folder', folderPath),
  compressFolder: (folderPath) => ipcRenderer.invoke('compress-folder', folderPath),
  getSession: () => ipcRenderer.invoke('get-session'),
  saveSession: (data) => ipcRenderer.invoke('save-session', data),
  fillPatreon: (data) => ipcRenderer.invoke('fill-patreon', data),
  openPatreon: () => ipcRenderer.invoke('open-patreon'),
  copyClipboard: (text) => ipcRenderer.invoke('copy-clipboard', text),
  triggerAutoUpload: (filePath) => ipcRenderer.invoke('trigger-auto-upload', filePath),
  onAutoQueueReady: (callback) => ipcRenderer.on('auto-queue-ready', callback),
  onAutoQueueDone: (callback) => ipcRenderer.on('auto-queue-done', callback)
});
