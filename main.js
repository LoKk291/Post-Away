const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');

let mainWindow;
const sessionFile = path.join(app.getPath('userData'), 'session.json');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

function loadSession() {
  try {
    if (fs.existsSync(sessionFile)) {
      const data = fs.readFileSync(sessionFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error("Error loading session:", e);
  }
  return { lastFolder: null, donePosts: {} };
}

function saveSession(data) {
  try {
    fs.writeFileSync(sessionFile, JSON.stringify(data));
  } catch (e) {
    console.error("Error saving session:", e);
  }
}

ipcMain.handle('get-session', () => {
  return loadSession();
});

ipcMain.handle('save-session', (event, data) => {
  saveSession(data);
});

ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('read-folder', async (event, folderPath) => {
  try {
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    const posts = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const subPath = path.join(folderPath, item.name);
        const folderName = item.name;
        
        let character = "";
        let anime = "";
        const match = folderName.match(/(.*?)\s*-\s*\[(.*?)\]/);
        if (match) {
          character = match[1].trim();
          anime = match[2].trim();
        } else {
          character = folderName;
          anime = "Desconocido";
        }

        let imagesCount = 0;
        let thumbnail = null;
        try {
          const files = fs.readdirSync(subPath);
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          const imageFiles = files.filter(f => imageExtensions.includes(path.extname(f).toLowerCase()));
          imagesCount = imageFiles.length;
          
          if (imageFiles.length > 0) {
            thumbnail = "file://" + path.join(subPath, imageFiles[0]).replace(/\\/g, '/');
          }
        } catch(e) {}

        const title = `${anime} - ${imagesCount} Pics - [${anime}]`;
        const tags = `${character}, ${anime}`;

        posts.push({
          id: Buffer.from(subPath).toString('base64'),
          folderName,
          path: subPath,
          character,
          anime,
          imagesCount,
          title,
          tags,
          thumbnail
        });
      }
    }
    return posts;
  } catch(e) {
    console.error(e);
    return [];
  }
});

ipcMain.handle('compress-folder', async (event, folderPath) => {
  return new Promise((resolve, reject) => {
    const parentDir = path.dirname(folderPath);
    const folderName = path.basename(folderPath);
    const winrarPath = 'C:\\Program Files\\WinRAR\\Rar.exe';
    const archiveName = `${folderName}.rar`;
    const archivePath = path.join(parentDir, archiveName);

    execFile(winrarPath, ['a', '-ep1', archivePath, folderPath], (error, stdout, stderr) => {
      if (error) {
        console.warn("WinRAR executed with message:", error.message);
        if (fs.existsSync(archivePath)) {
          resolve({ success: true, warning: error.message });
        } else {
          resolve({ success: false, error: error.message, details: stderr });
        }
      } else {
        resolve({ success: true });
      }
    });
  });
});
