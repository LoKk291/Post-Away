const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const http = require('http');

let mainWindow;
const sessionFile = path.join(app.getPath('userData'), 'session.json');

// HTTP SSE Server to securely communicate with the Chrome Extension
let localServer = null;
let sseClients = [];

function startLocalServer() {
  localServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    if (req.url === '/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });
      res.write('retry: 3000\n\n'); 
      sseClients.push(res);

      // TCP Lifecycle hook circumvents all browser adblockers and network shields natively linking the tab state
      if (mainWindow) {
        setTimeout(() => {
            mainWindow.webContents.send('auto-queue-ready');
        }, 100); 
      }

      req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
        // Emits auto-queue-done implicitly when the patreon tab undergoes URL navigation post-publish
        if (mainWindow) {
            mainWindow.webContents.send('auto-queue-done');
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  localServer.listen(3333, '127.0.0.1', () => {
    console.log("Local SSE Server running securely on 127.0.0.1:3333");
  });
}

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
  startLocalServer();
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

// Cleanly close server to avoid ghost ports
app.on('before-quit', () => {
  sseClients.forEach(c => c.end());
  if (localServer) {
    localServer.close();
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

ipcMain.handle('get-session', () => loadSession());
ipcMain.handle('save-session', (event, data) => saveSession(data));
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
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
        
        let character = "", anime = "";
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
          const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          const imageFiles = files.filter(f => ext.includes(path.extname(f).toLowerCase()));
          imagesCount = imageFiles.length;
          if (imageFiles.length > 0) {
            thumbnail = "file://" + path.join(subPath, imageFiles[0]).replace(/\\/g, '/');
          }
        } catch(e) {}

        const title = `${character} - ${imagesCount} Pics - [${anime}]`;
        const tags = `${character}, ${anime}`;

        posts.push({
          id: Buffer.from(subPath).toString('base64'),
          folderName, path: subPath, character, anime, imagesCount, title, tags, thumbnail
        });
      }
    }
    return posts;
  } catch(e) {
    console.error(e);
    return [];
  }
});

// Broadcast payload to SSE Clients
ipcMain.handle('fill-patreon', (event, data) => {
  const payload = JSON.stringify(data);
  sseClients.forEach(res => res.write(`data: ${payload}\n\n`));
  return { success: true, receivers: sseClients.length };
});

ipcMain.handle('open-patreon', () => {
  require('electron').shell.openExternal('https://www.patreon.com/posts/new').catch(e => {
    require('child_process').exec('start https://www.patreon.com/posts/new');
  });
});

ipcMain.handle('compress-folder', async (event, folderPath) => {
  return new Promise((resolve) => {
    const parentDir = path.dirname(folderPath);
    const folderName = path.basename(folderPath);
    const archivePath = path.join(parentDir, `${folderName}.rar`);

    execFile('C:\\Program Files\\WinRAR\\Rar.exe', ['a', '-ep1', archivePath, folderPath], (error, stdout, stderr) => {
      resolve(error && !fs.existsSync(archivePath) ? { success: false, error: error.message } : { success: true });
    });
  });
});
