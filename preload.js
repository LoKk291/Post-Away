const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  readFolder: (folderPath) => ipcRenderer.invoke('read-folder', folderPath),
  compressFolder: (folderPath) => ipcRenderer.invoke('compress-folder', folderPath),
  getSession: () => ipcRenderer.invoke('get-session'),
  saveSession: (data) => ipcRenderer.invoke('save-session', data),
  fillPatreon: (data) => ipcRenderer.invoke('fill-patreon', data),
  openPatreon: (profile) => ipcRenderer.invoke('open-patreon', profile),
  copyClipboard: (text) => ipcRenderer.invoke('copy-clipboard', text),
  triggerAutoUpload: (filePath) => ipcRenderer.invoke('trigger-auto-upload', filePath),
  openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
  onAutoQueueReady: (callback) => ipcRenderer.on('auto-queue-ready', callback),
  onAutoQueueDone: (callback) => ipcRenderer.on('auto-queue-done', callback),
  fetchPatreonLinks: (url, posts) => ipcRenderer.invoke('fetch-patreon-links', url, posts),
  deleteRars: (folderPaths) => ipcRenderer.invoke('delete-rars', folderPaths),
  getSiblingFolders: (folderPath) => ipcRenderer.invoke('get-sibling-folders', folderPath),
  checkFolderExists: (folderPath) => ipcRenderer.invoke('check-folder-exists', folderPath),
  mergeFolder: (folderPath) => ipcRenderer.invoke('merge-folder', folderPath),
  getOrgFolders: (basePath) => ipcRenderer.invoke('get-org-folders', basePath),
  createMonthFolder: (basePath, monthName) => ipcRenderer.invoke('create-month-folder', basePath, monthName),
  createDateFolder: (basePath, monthName, dateName) => ipcRenderer.invoke('create-date-folder', basePath, monthName, dateName),
  moveCharacterFolder: (charPath, targetBase, targetNova, month, date) => ipcRenderer.invoke('move-character-folder', charPath, targetBase, targetNova, month, date),
  deleteFolder: (folderPath) => ipcRenderer.invoke('delete-folder', folderPath),
  renameFolder: (folderPath, newName) => ipcRenderer.invoke('rename-folder', folderPath, newName),
  openInExplorer: (folderPath) => ipcRenderer.invoke('open-in-explorer', folderPath)
});
