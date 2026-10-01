const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { execFile } = require('child_process');
const http = require('http');

let mainWindow;
const sessionFile = path.join(app.getPath('userData'), 'session.json');

// HTTP SSE Server to securely communicate with the Chrome Extension
let localServer = null;
let sseClients = [];
let lastPollTime = 0;
let currentPayload = null;
let currentTwitterPayload = null;
let currentTwitterFeed = [];
let currentTwitterFeedIndex = 0;

function startLocalServer() {
  localServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Request-Private-Network');
    res.setHeader('Access-Control-Allow-Private-Network', 'true');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    if (req.method === 'GET' && req.url === '/poll') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      lastPollTime = Date.now();
      res.end(JSON.stringify({ payload: currentPayload }));
      currentPayload = null; // clear after consumed
      return;
    }

    if (req.method === 'GET' && req.url === '/poll-twitter') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      res.end(JSON.stringify({ payload: currentTwitterPayload }));
      currentTwitterPayload = null; // clear after consumed
      return;
    }

    if (req.method === 'GET' && req.url === '/twitter-feed') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      res.end(JSON.stringify({
        posts: currentTwitterFeed || [],
        currentIndex: currentTwitterFeedIndex || 0,
        activeProfile: loadSession()?.activeProfile || 'nicky'
      }));
      return;
    }

    if (req.method === 'POST' && req.url === '/twitter-feed/update-post') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
        try {
          const updated = JSON.parse(body);
          if (currentTwitterFeed && updated.id) {
            const item = currentTwitterFeed.find(p => p.id === updated.id);
            if (item) {
              if (updated.combinedText !== undefined) item.combinedText = updated.combinedText;
              if (updated.scheduleDate !== undefined) item.scheduleDate = updated.scheduleDate;
              if (updated.scheduleTime !== undefined) item.scheduleTime = updated.scheduleTime;
            }
          }
          const session = loadSession();
          if (!session.twitterSchedule) session.twitterSchedule = {};
          if (updated.id) {
            session.twitterSchedule[updated.id] = {
              date: updated.scheduleDate,
              time: updated.scheduleTime
            };
            saveSession(session);
          }
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('twitter-post-updated', updated);
          }
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Private-Network': 'true'
          });
          res.end(JSON.stringify({ success: true }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    if (req.method === 'GET' && req.url.startsWith('/thumbnail')) {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      const filePath = parsedUrl.searchParams.get('file');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      if (!filePath || !fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end("Not Found");
      }
      const ext = path.extname(filePath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'image/jpeg' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    if (req.method === 'POST' && req.url === '/upload-complete') {
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('upload-complete');
      }
      return res.end(JSON.stringify({ success: true }));
    }

    if (req.method === 'GET' && req.url.startsWith('/download')) {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      const filePath = parsedUrl.searchParams.get('file');
      
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Private-Network', 'true');

      if (!filePath || !require('fs').existsSync(filePath)) {
        res.writeHead(404);
        return res.end("Not Found");
      }

      const path = require('path');
      res.writeHead(200, {
        'Content-Type': 'application/x-rar-compressed',
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`
      });
      const readStream = require('fs').createReadStream(filePath);
      readStream.pipe(res);
      return;
    }

    if (req.url === '/events' && req.method === 'GET') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Private-Network': 'true'
      });
      res.write('retry: 3000\n\n'); 
      sseClients.push(res);

      // TCP Lifecycle hook circumvents all browser adblockers and network shields natively linking the tab state
      if (mainWindow && !mainWindow.isDestroyed()) {
        setTimeout(() => {
            if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('auto-queue-ready');
            }
        }, 100); 
      }

      req.on('close', () => {
        sseClients = sseClients.filter(c => c !== res);
        // Emits auto-queue-done implicitly when the patreon tab undergoes URL navigation post-publish
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.webContents.send('auto-queue-done');
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  localServer.listen(3030, '127.0.0.1', () => {
    console.log("Local SSE Server running securely on 127.0.0.1:3030");
  });
}

let mobileServer = null;

function getLocalIP() {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let fallbackIp = '127.0.0.1';
  
  for (const name of Object.keys(interfaces)) {
    // Evitar adaptadores de máquinas virtuales (VMware, VirtualBox, WSL)
    const lowerName = name.toLowerCase();
    if (lowerName.includes('vmware') || lowerName.includes('virtual') || lowerName.includes('wsl') || lowerName.includes('veth')) {
        continue;
    }
    
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Priorizar IPs de redes domésticas (192.168.x.x)
        if (iface.address.startsWith('192.168.')) {
            return iface.address;
        }
        if (fallbackIp === '127.0.0.1') {
            fallbackIp = iface.address;
        }
      }
    }
  }
  return fallbackIp;
}

function startMobileServer() {
  mobileServer = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    const parsedUrl = new URL(req.url, 'http://localhost');

    if (req.method === 'GET' && parsedUrl.pathname === '/') {
      try {
        const html = fs.readFileSync(path.join(__dirname, 'mobile.html'));
        res.writeHead(200, { 'Content-Type': 'text/html' });
        return res.end(html);
      } catch (e) {
        res.writeHead(404);
        return res.end('Not found');
      }
    }
    if (req.method === 'GET' && parsedUrl.pathname === '/mobile.css') {
      try {
        const css = fs.readFileSync(path.join(__dirname, 'mobile.css'));
        res.writeHead(200, { 'Content-Type': 'text/css' });
        return res.end(css);
      } catch (e) {
        res.writeHead(404);
        return res.end('Not found');
      }
    }
    if (req.method === 'GET' && parsedUrl.pathname === '/mobile.js') {
      try {
        const js = fs.readFileSync(path.join(__dirname, 'mobile.js'));
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        return res.end(js);
      } catch (e) {
        res.writeHead(404);
        return res.end('Not found');
      }
    }

    // API ENDPOINTS
    if (req.method === 'POST' && parsedUrl.pathname === '/api/rename') {
      let body = '';
      req.on('data', chunk => body += chunk.toString());
      req.on('end', () => {
          try {
              const { oldPath, newName } = JSON.parse(body);
              const newPath = path.join(path.dirname(oldPath), newName);
              fs.renameSync(oldPath, newPath);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, newPath }));
          } catch (e) {
              res.writeHead(500);
              res.end(JSON.stringify({ error: e.message }));
          }
      });
      return;
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/toggle-nicky-nova') {
      const folderPath = parsedUrl.searchParams.get('path');
      const session = loadSession();
      if (!folderPath) {
        res.writeHead(400);
        return res.end(JSON.stringify({ error: 'Missing path' }));
      }
      try {
        let searchDir = '';
        let baseName = path.basename(folderPath).trim();
        const baseOrgPath = session.baseOrgPath;
        const novaOrgPath = session.novaOrgPath;
        const isCurrentlyNova = baseName.toLowerCase().includes('[nova]');
        
        // Find searchDir
        if (baseOrgPath && folderPath.startsWith(baseOrgPath)) {
          const relative = path.relative(baseOrgPath, folderPath);
          const parts = relative.split(path.sep);
          if (parts.length >= 3) {
            const month = parts[0];
            const date = parts[1];
            searchDir = path.join(novaOrgPath, month, date);
          }
        } else if (novaOrgPath && folderPath.startsWith(novaOrgPath)) {
          const relative = path.relative(novaOrgPath, folderPath);
          const parts = relative.split(path.sep);
          if (parts.length >= 3) {
            const month = parts[0];
            const date = parts[1];
            searchDir = path.join(baseOrgPath, month, date);
          }
        } else {
          searchDir = path.dirname(folderPath);
        }

        let counterpartPath = null;
        if (searchDir && fs.existsSync(searchDir)) {
            const items = fs.readdirSync(searchDir, { withFileTypes: true });
            for (const item of items) {
              if (item.isDirectory()) {
                let checkName = item.name.toLowerCase().trim();
                let cleanOriginal = baseName.toLowerCase().replace(/\s*-\s*\[nicky\].*$/, '').replace(/\s*-\s*\[nova\].*$/, '');
                let cleanCheck = checkName.replace(/\s*-\s*\[nicky\].*$/, '').replace(/\s*-\s*\[nova\].*$/, '');
                
                if (cleanOriginal === cleanCheck) {
                  const checkIsNova = checkName.includes('[nova]');
                  if (isCurrentlyNova && !checkIsNova) {
                    counterpartPath = path.join(searchDir, item.name);
                    break;
                  }
                  if (!isCurrentlyNova && checkIsNova) {
                    counterpartPath = path.join(searchDir, item.name);
                    break;
                  }
                }
              }
            }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ counterpartPath, isTargetNova: !isCurrentlyNova }));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (parsedUrl.pathname === '/api/qc') {
      if (req.method === 'GET') {
        const session = loadSession();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(session.qcDone || {}));
      } else if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            try {
                const { folderName, isDone } = JSON.parse(body);
                const session = loadSession();
                if (!session.qcDone) session.qcDone = {};
                session.qcDone[folderName] = isDone;
                saveSession(session);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            } catch (e) {
                res.writeHead(400);
                res.end(JSON.stringify({ error: e.message }));
            }
        });
        return;
      }
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/output-folders') {
      const session = loadSession();
      const basePath = session.outputPath;
      if (!basePath || !fs.existsSync(basePath)) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Output path not set or not found' }));
      }
      try {
        const items = fs.readdirSync(basePath, { withFileTypes: true });
        const folders = items.filter(i => i.isDirectory() && !i.name.toLowerCase().includes('nova')).map(i => ({
          name: i.name,
          path: path.join(basePath, i.name)
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(folders));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/gestor') {
      const session = loadSession();
      const basePath = session.baseOrgPath;
      if (!basePath || !fs.existsSync(basePath)) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Gestor base path not set or not found' }));
      }
      try {
        const items = fs.readdirSync(basePath, { withFileTypes: true });
        const folders = [];
        for (const item of items) {
          if (item.isDirectory()) {
            const monthPath = path.join(basePath, item.name);
            const dateItems = fs.readdirSync(monthPath, { withFileTypes: true });
            const dates = dateItems
                .filter(d => d.isDirectory())
                .map(d => ({ name: d.name, path: path.join(monthPath, d.name) }));
            folders.push({ name: item.name, path: monthPath, dates });
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(folders));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/current-folder') {
      const session = loadSession();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ folder: session.lastFolder }));
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/folders') {
      const folderPath = parsedUrl.searchParams.get('path');
      if (!folderPath || !fs.existsSync(folderPath)) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      try {
        const items = fs.readdirSync(folderPath, { withFileTypes: true });
        const folders = items.filter(i => i.isDirectory()).map(i => ({
          name: i.name,
          path: path.join(folderPath, i.name)
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(folders));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/images') {
      const folderPath = parsedUrl.searchParams.get('path');
      if (!folderPath || !fs.existsSync(folderPath)) {
        res.writeHead(404);
        return res.end(JSON.stringify({ error: 'Not found' }));
      }
      try {
        const files = fs.readdirSync(folderPath);
        const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const imageFiles = files.filter(f => ext.includes(path.extname(f).toLowerCase()));
        imageFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        
        const result = imageFiles.map(f => ({
          name: f,
          path: path.join(folderPath, f)
        }));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(result));
      } catch (e) {
        res.writeHead(500);
        return res.end(JSON.stringify({ error: e.message }));
      }
    }

    if (req.method === 'GET' && parsedUrl.pathname === '/api/image') {
      const filePath = parsedUrl.searchParams.get('path');
      if (!filePath || !fs.existsSync(filePath)) {
        res.writeHead(404);
        return res.end("Not Found");
      }
      res.writeHead(200);
      const readStream = fs.createReadStream(filePath);
      return readStream.pipe(res);
    }

    if (req.method === 'POST' && parsedUrl.pathname === '/api/delete') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', async () => {
        try {
          const data = JSON.parse(body);
          if (data.path && fs.existsSync(data.path)) {
            await shell.trashItem(data.path);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ success: true }));
          }
          res.writeHead(404);
          return res.end(JSON.stringify({ success: false, error: 'Not found' }));
        } catch (e) {
          res.writeHead(500);
          return res.end(JSON.stringify({ success: false, error: e.message }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end();
  });

  mobileServer.listen(3031, () => {
    console.log("Mobile Server running on all interfaces:3031");
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      backgroundThrottling: false
    }
  });
  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  startLocalServer();
  startMobileServer();
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
  if (mobileServer) {
    mobileServer.close();
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
ipcMain.handle('get-local-ip', () => getLocalIP());
ipcMain.handle('get-hostname', () => require('os').hostname());

ipcMain.handle('save-session', (event, data) => saveSession(data));
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (result.canceled) return null;
  return result.filePaths[0];
});
ipcMain.handle('open-folder', async (event, folderPath) => {
  if (folderPath) {
    await require('electron').shell.openPath(folderPath);
  }
});

const https = require('https');

async function translateToJapanese(text) {
  return new Promise((resolve) => {
    if (!text || text === "Desconocido") return resolve("");
    // Use Google's public translation endpoint
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ja&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json[0][0][0]);
        } catch (e) {
          resolve("");
        }
      });
    }).on('error', () => resolve(""));
  });
}

ipcMain.handle('read-folder', async (event, folderPath) => {
  try {
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    const posts = [];

    for (const item of items) {
      if (item.isDirectory()) {
        const subPath = path.join(folderPath, item.name);
        const folderName = item.name;
        
        let character = "", characterJP = "", anime = "", animeJP = "";
        
        // Pattern: Character (Char JP) - XXX Pics - [Anime (Anime JP)]
        const match = folderName.match(/(.*?)\s*-\s*(?:\d+\s*Pics\s*-\s*)?\[(.*?)\]/);
        
        if (match) {
          const charPart = match[1].trim();
          const animePart = match[2].trim();
          
          // Character names
          const charJpMatch = charPart.match(/(.*?)\s*\(+(.*?)\)+/);
          if (charJpMatch) {
            character = charJpMatch[1].trim();
            characterJP = charJpMatch[2].trim();
          } else {
            character = charPart;
          }

          // Anime names
          const animeJpMatch = animePart.match(/(.*?)\s*\(+(.*?)\)+/);
          if (animeJpMatch) {
            anime = animeJpMatch[1].trim();
            animeJP = animeJpMatch[2].trim();
          } else {
            anime = animePart;
          }
        } else {
          character = folderName;
          anime = "Desconocido";
        }

        // Gather all translation promises to run in parallel
        let charPromise = (!characterJP && character) ? translateToJapanese(character) : Promise.resolve(characterJP);
        let animePromise = (!animeJP && anime && anime !== "Desconocido") ? translateToJapanese(anime) : Promise.resolve(animeJP);

        let [translatedChar, translatedAnime] = await Promise.all([charPromise, animePromise]);
        characterJP = translatedChar;
        animeJP = translatedAnime;

        let imagesCount = 0;
        let thumbnail = null;
        let imagePaths = [];
        let createdAt = 0;
        try {
          const files = fs.readdirSync(subPath);
          const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          const imageFiles = files.filter(f => ext.includes(path.extname(f).toLowerCase()));
          imagesCount = imageFiles.length;
          if (imageFiles.length > 0) {
            thumbnail = "file://" + path.join(subPath, imageFiles[0]).replace(/\\/g, '/');
            imagePaths = imageFiles.map(f => path.join(subPath, f));
          }
          const stats = fs.statSync(subPath);
          createdAt = stats.birthtimeMs || stats.ctimeMs || 0;
        } catch(e) {}

        const title = `${character} - ${imagesCount} Pics - [${anime}]`;
        const tags = `${character}, ${anime}`;
        
        const rarPath = path.join(folderPath, `${folderName}.rar`);
        const hasRar = fs.existsSync(rarPath);

        posts.push({
          id: Buffer.from(subPath).toString('base64'),
          folderName, 
          path: subPath, 
          character, 
          characterJP, 
          anime, 
          animeJP, 
          imagesCount, 
          title, 
          tags, 
          thumbnail,
          imagePaths,
          createdAt,
          hasRar
        });
      }
    }
    return posts;
  } catch(e) {
    console.error(e);
    return [];
  }
});

ipcMain.handle('get-nova-folder-path', async (event, nickyPath, baseOrgPath, novaOrgPath) => {
  try {
    let searchDir = '';
    let nickyBaseName = path.basename(nickyPath).toLowerCase().trim();

    // Check if it's in org path
    if (baseOrgPath && nickyPath.startsWith(baseOrgPath)) {
      const relative = path.relative(baseOrgPath, nickyPath);
      const parts = relative.split(path.sep);
      if (parts.length >= 3) {
        const month = parts[0];
        const date = parts[1];
        searchDir = path.join(novaOrgPath, month, date);
      }
    } else {
      // It's in Output
      searchDir = path.dirname(nickyPath);
    }

    if (!searchDir || !fs.existsSync(searchDir)) return null;

    const allFiles = fs.readdirSync(searchDir, { withFileTypes: true });
    
    const novaFolder = allFiles.find(dirent => {
        if (!dirent.isDirectory()) return false;
        const name = dirent.name.toLowerCase();
        
        if (!name.includes('[nova]')) return false;
        if (name.includes(nickyBaseName)) return true;
        
        const cleanNova = name.replace(/\[nova\]/g, '').replace(/[\[\]]/g, '').trim();
        const cleanNicky = nickyBaseName.replace(/\[nicky\]/g, '').replace(/[\[\]]/g, '').trim();
        
        return cleanNova === cleanNicky || cleanNova.includes(cleanNicky) || cleanNicky.includes(cleanNova);
    });

    if (novaFolder) {
        return path.join(searchDir, novaFolder.name);
    }
    return null;
  } catch(e) {
    console.error("Error getting nova folder:", e);
    return null;
  }
});

ipcMain.handle('get-folder-images', async (event, folderPath) => {
  try {
    if (!fs.existsSync(folderPath)) return [];
    const files = fs.readdirSync(folderPath);
    const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const imageFiles = files.filter(f => ext.includes(path.extname(f).toLowerCase()));
    
    // Sort logically to maintain consistent order
    imageFiles.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    
    return imageFiles.map(f => ({
      name: f,
      path: path.join(folderPath, f)
    }));
  } catch(e) {
    console.error("Error getting folder images:", e);
    return [];
  }
});

ipcMain.handle('rename-file', async (event, oldPath, newName) => {
  try {
    const parentDir = path.dirname(oldPath);
    const newPath = path.join(parentDir, newName);
    if (fs.existsSync(newPath)) {
      return { success: false, error: 'El archivo ya existe.' };
    }
    fs.renameSync(oldPath, newPath);
    return { success: true, newPath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('delete-file-trash', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      await shell.trashItem(filePath);
      return { success: true, originalPath: filePath };
    }
    return { success: false, error: 'Archivo no encontrado' };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('restore-file-trash', async (event, trashPath, originalPath) => {
  // Ya no se usa porque usamos la papelera del sistema, 
  // pero lo dejamos vacío para no romper el IPC.
  return { success: false, error: 'La restauración desde la papelera de Windows debe hacerse manualmente.' };
});

// Broadcast payload to SSE Clients or prepare for polling
ipcMain.handle('fill-patreon', (event, data) => {
  const isPollingActive = (Date.now() - lastPollTime < 4000);
  currentPayload = data; // Siempre guardar el payload
  const payload = JSON.stringify(data);
  sseClients.forEach(res => res.write(`data: ${payload}\n\n`));
  return { success: true, receivers: sseClients.length + 1 };
});

ipcMain.handle('open-patreon', (event, profile) => {
  const url = 'https://www.patreon.com/posts/new';
  const { spawn } = require('child_process');
  console.log('[Post-Away] open-patreon called with profile:', profile);
  
  let browserPath;
  if (profile === 'nova') {
    browserPath = path.join(require('os').homedir(), 'AppData', 'Local', 'Programs', 'Opera GX', 'opera.exe');
  } else {
    browserPath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
  }
  
  console.log('[Post-Away] Launching:', browserPath);
  const child = spawn(browserPath, [url], { detached: true, stdio: 'ignore' });
  child.unref();
});

ipcMain.handle('fill-twitter', (event, data) => {
  currentTwitterPayload = data;
  return { success: true };
});

ipcMain.handle('set-twitter-feed', (event, feedData) => {
  currentTwitterFeed = feedData.posts || [];
  currentTwitterFeedIndex = feedData.currentIndex || 0;
  return { success: true };
});

ipcMain.handle('open-twitter', (event, profile) => {
  const url = 'https://x.com/compose/post';
  const { spawn } = require('child_process');
  console.log('[Post-Away] open-twitter called with profile:', profile);
  
  let browserPath;
  if (profile === 'nova') {
    browserPath = path.join(require('os').homedir(), 'AppData', 'Local', 'Programs', 'Opera GX', 'opera.exe');
  } else {
    browserPath = 'C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe';
  }
  
  console.log('[Post-Away] Launching for Twitter:', browserPath);
  const child = spawn(browserPath, [url], { detached: true, stdio: 'ignore' });
  child.unref();
  return { success: true };
});

ipcMain.handle('get-watermark-images', async (event, folderPath) => {
  try {
    if (!folderPath || !fs.existsSync(folderPath)) return [];
    const validExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    let targetDir = folderPath;
    
    const items = fs.readdirSync(folderPath, { withFileTypes: true });
    const wmFolder = items.find(item => 
      item.isDirectory() && 
      (item.name.toLowerCase().includes('marca') || item.name.toLowerCase().includes('watermark'))
    );
    
    if (wmFolder) {
      targetDir = path.join(folderPath, wmFolder.name);
    }
    
    const files = fs.readdirSync(targetDir)
      .filter(f => validExts.includes(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }))
      .map(f => path.join(targetDir, f));
      
    return files.slice(0, 4);
  } catch (err) {
    console.error("Error getting watermark images:", err);
    return [];
  }
});

ipcMain.handle('copy-clipboard', (event, text) => {
  require('electron').clipboard.writeText(text);
  return true;
});

ipcMain.handle('trigger-auto-upload', (event, filePath) => {
  require('electron').clipboard.writeText(filePath);
  return true;
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

ipcMain.handle('delete-rars', async (event, folderPaths) => {
  for (const folderPath of folderPaths) {
    try {
      const parentDir = path.dirname(folderPath);
      const folderName = path.basename(folderPath);
      const archivePath = path.join(parentDir, `${folderName}.rar`);
      if (fs.existsSync(archivePath)) {
        fs.unlinkSync(archivePath);
      }
    } catch (e) {
      console.error("Error deleting rar:", e);
    }
  }
  return true;
});

ipcMain.handle('get-sibling-folders', async (event, folderPath) => {
  try {
    const parentDir = path.dirname(folderPath);
    const items = fs.readdirSync(parentDir, { withFileTypes: true });
    const folders = items
      .filter(item => item.isDirectory())
      .map(item => ({
        name: item.name,
        path: path.join(parentDir, item.name)
      }));
    return folders;
  } catch (e) {
    console.error("Error getting sibling folders:", e);
    return [];
  }
});

ipcMain.handle('fetch-patreon-links', async (event, creatorUrl, posts) => {
  return new Promise((resolve) => {
    let cleanUrl = creatorUrl.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    if (!cleanUrl.includes('/posts') && !cleanUrl.includes('?')) {
      if (cleanUrl.includes('/c/')) {
        cleanUrl = cleanUrl.replace(/\/$/, '') + '/posts';
      }
    }

    const hiddenWin = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    hiddenWin.loadURL(cleanUrl);

    hiddenWin.webContents.on('did-finish-load', async () => {
      setTimeout(async () => {
        try {
          const result = await hiddenWin.webContents.executeJavaScript(`
            (async () => {
              try {
                let campaignId = null;
                const html = document.documentElement.innerHTML;
                
                let match = html.match(/"campaign_id"\\s*:\\s*"?(\\d+)"?/);
                if (!match) match = html.match(/campaign_id[=":\\s]+(\\d+)/);
                if (!match) match = html.match(/"campaign":\\s*\\{\\s*"data":\\s*\\{\\s*"id":\\s*"(\\d+)"/);
                if (!match) match = html.match(/https:\\/\\/www\\.patreon\\.com\\/api\\/campaigns\\/(\\d+)/);
                if (!match) match = html.match(/"creator_id":\\s*"?(\\d+)"?/);

                if (match) campaignId = match[1];

                if (!campaignId) {
                  const postsList = [];
                  const links = document.querySelectorAll('a[href*="/posts/"]');
                  for (const a of links) {
                    const url = a.href;
                    const titleEl = a.querySelector('[data-tag="post-title"]') || a;
                    const title = titleEl.innerText || a.innerText || "";
                    if (title && url.includes('/posts/') && !url.includes('edit')) {
                      postsList.push({ title: title.toLowerCase(), url: url, publishedAt: new Date().getTime() });
                    }
                  }
                  return { success: true, posts: postsList, fallback: true };
                }

                const apiUrl = 'https://www.patreon.com/api/posts?include=campaign&filter[campaign_id]=' + campaignId + '&sort=-published_at&page[count]=50&json-api-version=1.0';
                const res = await fetch(apiUrl);
                if (!res.ok) {
                  return { success: false, error: 'API fetch failed with status ' + res.status };
                }
                const data = await res.json();
                
                const patreonPosts = (data.data || []).map(p => {
                  return {
                    title: (p.attributes.title || '').toLowerCase(),
                    url: p.attributes.url || ('https://www.patreon.com/posts/' + p.id),
                    publishedAt: new Date(p.attributes.published_at || 0).getTime()
                  };
                });
                return { success: true, posts: patreonPosts };
              } catch (e) {
                return { success: false, error: e.toString() };
              }
            })();
          `);

          hiddenWin.destroy();

          if (!result || !result.success) {
            return resolve({ success: false, error: result ? result.error : 'Error extrayendo datos de Patreon.' });
          }

          const patreonPosts = result.posts;
          const matchedLinks = {};
          
          for (const p of posts) {
            const charName = (p.character || "").toLowerCase();
            const charNameJP = (p.characterJP || "").toLowerCase();

            let bestMatch = null;
            for (const patreonPost of patreonPosts) {
              const title = patreonPost.title;
              const matchesEN = charName && title.includes(charName);
              const matchesJP = charNameJP && title.includes(charNameJP);
              
              if (matchesEN || matchesJP) {
                if (!bestMatch || patreonPost.publishedAt > bestMatch.publishedAt) {
                  bestMatch = patreonPost;
                }
              }
            }

            if (bestMatch) {
              matchedLinks[p.folderName] = bestMatch.url;
            }
          }

          resolve({ success: true, links: matchedLinks });
        } catch (err) {
          if (!hiddenWin.isDestroyed()) hiddenWin.destroy();
          resolve({ success: false, error: err.message });
        }
      }, 4000);
    });

    hiddenWin.webContents.on('did-fail-load', () => {
      if (!hiddenWin.isDestroyed()) hiddenWin.destroy();
      resolve({ success: false, error: 'Falló la conexión al cargar la URL de Patreon.' });
    });
  });
});

ipcMain.handle('check-folder-exists', (event, folderPath) => {
  try {
    return fs.existsSync(folderPath);
  } catch(e) {
    return false;
  }
});

ipcMain.handle('check-is-directory', (event, folderPath) => {
  try {
    return fs.statSync(folderPath).isDirectory();
  } catch(e) {
    return false;
  }
});

ipcMain.handle('merge-folder', async (event, sourcePath) => {
  try {
    const targetPath = sourcePath.replace(/_agregados$/i, '');
    
    // Si la carpeta destino no existe, simplemente renombramos la origen
    if (!fs.existsSync(targetPath)) {
      fs.renameSync(sourcePath, targetPath);
      return { success: true, targetPath };
    }

    // Mover el contenido
    const items = fs.readdirSync(sourcePath);
    for (const item of items) {
      const oldPath = path.join(sourcePath, item);
      const newPath = path.join(targetPath, item);
      
      // Si ya existe en el destino, intentamos mover de todos modos (puede fallar si es un directorio no vacío)
      if (fs.existsSync(newPath)) {
          // Para este caso básico, si existe, asumimos que se sobreescribe o falla
          // Lo ideal es que sean personajes nuevos que no existían en la original.
      }
      fs.renameSync(oldPath, newPath);
    }
    
    // Borrar la carpeta origen que ahora debería estar vacía
    fs.rmdirSync(sourcePath);
    
    return { success: true, targetPath };
  } catch (e) {
    console.error("Error merging folder:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('get-org-folders', async (event, basePath) => {
  try {
    if (!basePath || !fs.existsSync(basePath)) return [];
    const items = fs.readdirSync(basePath, { withFileTypes: true });
    const folders = [];
    for (const item of items) {
      if (item.isDirectory()) {
        const monthPath = path.join(basePath, item.name);
        const dateItems = fs.readdirSync(monthPath, { withFileTypes: true });
        const dates = dateItems
            .filter(d => d.isDirectory())
            .map(d => ({ name: d.name, path: path.join(monthPath, d.name) }));
        folders.push({ name: item.name, path: monthPath, dates });
      }
    }
    return folders;
  } catch (e) {
    console.error("Error getting org folders:", e);
    return [];
  }
});

ipcMain.handle('create-month-folder', async (event, basePath, monthName) => {
    try {
        const targetPath = path.join(basePath, monthName);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('create-date-folder', async (event, basePath, month, date) => {
  try {
    const monthPath = path.join(basePath, month);
    if (!fs.existsSync(monthPath)) fs.mkdirSync(monthPath, { recursive: true });
    
    const datePath = path.join(monthPath, date);
    if (!fs.existsSync(datePath)) fs.mkdirSync(datePath, { recursive: true });
    
    return { success: true, path: datePath };
  } catch (e) {
    console.error("Error creating date folder:", e);
    return { success: false, error: e.message };
  }
});

ipcMain.handle('move-character-folder', async (event, charPath, targetBase, targetNova, month, date) => {
    try {
        const folderName = path.basename(charPath);
        const sourceDir = path.dirname(charPath);
        
        const nickyDatePath = path.join(targetBase, month, date);
        if (!fs.existsSync(nickyDatePath)) fs.mkdirSync(nickyDatePath, { recursive: true });
        
        const nickyDest = path.join(nickyDatePath, folderName);
        
        try {
            fs.renameSync(charPath, nickyDest);
        } catch (err) {
            if (err.code === 'EXDEV') {
                fs.cpSync(charPath, nickyDest, { recursive: true });
                fs.rmSync(charPath, { recursive: true, force: true });
            } else {
                throw err;
            }
        }

        if (targetNova) {
            const allFiles = fs.readdirSync(sourceDir, { withFileTypes: true });
            const nickyBaseName = folderName.toLowerCase().trim();
            
            const novaFolder = allFiles.find(dirent => {
                if (!dirent.isDirectory()) return false;
                const name = dirent.name.toLowerCase();
                
                // Debe contener "[nova]"
                if (!name.includes('[nova]')) return false;
                
                // Verificamos si contiene el nombre base
                if (name.includes(nickyBaseName)) return true;
                
                // O si quitando la etiqueta [nova] encaja con el nombre original
                const cleanNova = name.replace(/\[nova\]/g, '').replace(/[\[\]]/g, '').trim();
                const cleanNicky = nickyBaseName.replace(/\[nicky\]/g, '').replace(/[\[\]]/g, '').trim();
                
                return cleanNova === cleanNicky || cleanNova.includes(cleanNicky) || cleanNicky.includes(cleanNova);
            });

            if (novaFolder) {
                const novaSrcPath = path.join(sourceDir, novaFolder.name);
                const novaDatePath = path.join(targetNova, month, date);
                if (!fs.existsSync(novaDatePath)) fs.mkdirSync(novaDatePath, { recursive: true });
                
                const novaDest = path.join(novaDatePath, novaFolder.name);
                
                try {
                    fs.renameSync(novaSrcPath, novaDest);
                } catch (err) {
                    if (err.code === 'EXDEV') {
                        fs.cpSync(novaSrcPath, novaDest, { recursive: true });
                        fs.rmSync(novaSrcPath, { recursive: true, force: true });
                    } else {
                        throw err;
                    }
                }
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Error moving character folder:", error);
        return { success: false, error: error.message };
    }
});

ipcMain.handle('move-organized-character', async (event, charName, sourceMonth, sourceDate, targetMonth, targetDate, baseOrgPath, novaOrgPath) => {
    try {
        const nickySrc = path.join(baseOrgPath, sourceMonth, sourceDate, charName);
        const nickyDatePath = path.join(baseOrgPath, targetMonth, targetDate);
        if (!fs.existsSync(nickyDatePath)) fs.mkdirSync(nickyDatePath, { recursive: true });
        
        const nickyDest = path.join(nickyDatePath, charName);

        if (fs.existsSync(nickySrc)) {
            try {
                fs.renameSync(nickySrc, nickyDest);
            } catch (err) {
                if (err.code === 'EXDEV') {
                    fs.cpSync(nickySrc, nickyDest, { recursive: true });
                    fs.rmSync(nickySrc, { recursive: true, force: true });
                } else {
                    throw err;
                }
            }
        }

        if (novaOrgPath) {
            const novaSourceDateDir = path.join(novaOrgPath, sourceMonth, sourceDate);
            if (fs.existsSync(novaSourceDateDir)) {
                const allFiles = fs.readdirSync(novaSourceDateDir, { withFileTypes: true });
                const nickyBaseName = charName.toLowerCase().trim();
                
                const novaFolder = allFiles.find(dirent => {
                    if (!dirent.isDirectory()) return false;
                    const name = dirent.name.toLowerCase();
                    if (!name.includes('[nova]')) return false;
                    
                    if (name.includes(nickyBaseName)) return true;
                    
                    const cleanNova = name.replace(/\[nova\]/g, '').replace(/[\[\]]/g, '').trim();
                    const cleanNicky = nickyBaseName.replace(/\[nicky\]/g, '').replace(/[\[\]]/g, '').trim();
                    
                    return cleanNova === cleanNicky || cleanNova.includes(cleanNicky) || cleanNicky.includes(cleanNova);
                });

                if (novaFolder) {
                    const novaSrcPath = path.join(novaSourceDateDir, novaFolder.name);
                    const novaDatePath = path.join(novaOrgPath, targetMonth, targetDate);
                    if (!fs.existsSync(novaDatePath)) fs.mkdirSync(novaDatePath, { recursive: true });
                    
                    const novaDest = path.join(novaDatePath, novaFolder.name);
                    
                    try {
                        fs.renameSync(novaSrcPath, novaDest);
                    } catch (err) {
                        if (err.code === 'EXDEV') {
                            fs.cpSync(novaSrcPath, novaDest, { recursive: true });
                            fs.rmSync(novaSrcPath, { recursive: true, force: true });
                        } else {
                            throw err;
                        }
                    }
                }
            }
        }

        return { success: true };
    } catch (err) {
        console.error("Error moving organized character:", err);
        return { success: false, error: err.message };
    }
});

ipcMain.handle('delete-folder', async (event, folderPath) => {
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true });
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('rename-folder', async (event, folderPath, newName) => {
    try {
        if (fs.existsSync(folderPath)) {
            const parentDir = path.dirname(folderPath);
            const newPath = path.join(parentDir, newName);
            fs.renameSync(folderPath, newPath);
        }
        return { success: true };
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('open-in-explorer', async (event, folderPath) => {
    try {
        if (!folderPath) {
            return { success: false, error: 'Ruta no especificada' };
        }
        const normalized = path.normalize(folderPath);
        if (fs.existsSync(normalized)) {
            const err = await shell.openPath(normalized);
            if (err) {
                return { success: false, error: err };
            }
            return { success: true };
        } else {
            return { success: false, error: 'La carpeta no existe: ' + folderPath };
        }
    } catch (err) {
        return { success: false, error: err.message };
    }
});

ipcMain.handle('search-characters', async (event, query, basePath, outputPath) => {
    try {
        const results = [];
        const lowerQuery = query.toLowerCase();

        // 1. Search in Output folder
        if (outputPath && fs.existsSync(outputPath)) {
            const outItems = fs.readdirSync(outputPath, { withFileTypes: true });
            for (const item of outItems) {
                if (item.isDirectory() && item.name.toLowerCase().includes(lowerQuery)) {
                    if (!item.name.toLowerCase().includes('nova')) {
                        results.push({
                            folderName: item.name,
                            type: 'output',
                            locationText: 'Output',
                            path: path.join(outputPath, item.name)
                        });
                    }
                }
            }
        }

        // 2. Search in Base Org folders (Months -> Dates -> Characters)
        if (basePath && fs.existsSync(basePath)) {
            const months = fs.readdirSync(basePath, { withFileTypes: true });
            for (const m of months) {
                if (m.isDirectory()) {
                    const monthPath = path.join(basePath, m.name);
                    const dates = fs.readdirSync(monthPath, { withFileTypes: true });
                    for (const d of dates) {
                        if (d.isDirectory()) {
                            const datePath = path.join(monthPath, d.name);
                            const chars = fs.readdirSync(datePath, { withFileTypes: true });
                            for (const c of chars) {
                                if (c.isDirectory() && c.name.toLowerCase().includes(lowerQuery)) {
                                    results.push({
                                        folderName: c.name,
                                        type: 'organized',
                                        locationText: `${m.name} / ${d.name}`,
                                        path: path.join(datePath, c.name),
                                        month: m.name,
                                        date: d.name
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }

        return { success: true, results };
    } catch (e) {
        console.error("Error searching characters:", e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('send-to-rulex', async (event, basePath, rulexPath, targetMonthName, dateName) => {
    try {
        const sourcePath = basePath;
        if (!fs.existsSync(sourcePath)) {
            return { success: false, error: 'Carpeta de origen no encontrada.' };
        }

        const targetMonthPath = path.join(rulexPath, targetMonthName);
        if (!fs.existsSync(targetMonthPath)) {
            fs.mkdirSync(targetMonthPath, { recursive: true });
        }

        const targetPath = path.join(targetMonthPath, dateName);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        // Leer el contenido de la carpeta fecha de origen
        const items = fs.readdirSync(sourcePath, { withFileTypes: true });
        let movedCount = 0;

        for (const item of items) {
            // Ignorar archivos sueltos, solo procesar carpetas (personajes)
            if (item.isDirectory()) {
                const folderName = item.name.toLowerCase();
                // Si la carpeta NO contiene "nova", se considera de Nicky y se mueve
                if (!folderName.includes('nova')) {
                    const charSrc = path.join(sourcePath, item.name);
                    const charDest = path.join(targetPath, item.name);
                    
                    try {
                        fs.renameSync(charSrc, charDest);
                        movedCount++;
                    } catch (err) {
                        if (err.code === 'EXDEV') {
                            fs.cpSync(charSrc, charDest, { recursive: true });
                            fs.rmSync(charSrc, { recursive: true, force: true });
                            movedCount++;
                        } else {
                            throw err;
                        }
                    }
                }
            }
        }

        // Si la carpeta original quedó vacía, la eliminamos
        const remainingItems = fs.readdirSync(sourcePath);
        if (remainingItems.length === 0) {
            fs.rmdirSync(sourcePath);
        }

        return { success: true, moved: movedCount };
    } catch (e) {
        console.error("Error sending to Rule y X:", e);
        return { success: false, error: e.message };
    }
});

ipcMain.handle('send-to-yasubido', async (event, basePath, yaSubidoPath, targetMonthName, dateName) => {
    try {
        const sourcePath = basePath;
        if (!fs.existsSync(sourcePath)) {
            return { success: false, error: 'Carpeta de origen no encontrada.' };
        }

        const targetMonthPath = path.join(yaSubidoPath, targetMonthName);
        if (!fs.existsSync(targetMonthPath)) {
            fs.mkdirSync(targetMonthPath, { recursive: true });
        }

        const targetPath = path.join(targetMonthPath, dateName);
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        const items = fs.readdirSync(sourcePath, { withFileTypes: true });
        let movedCount = 0;

        for (const item of items) {
            if (item.isDirectory()) {
                const folderName = item.name.toLowerCase();
                if (!folderName.includes('nova')) {
                    const charSrc = path.join(sourcePath, item.name);
                    const charDest = path.join(targetPath, item.name);
                    
                    try {
                        fs.renameSync(charSrc, charDest);
                        movedCount++;
                    } catch (err) {
                        if (err.code === 'EXDEV') {
                            fs.cpSync(charSrc, charDest, { recursive: true });
                            fs.rmSync(charSrc, { recursive: true, force: true });
                            movedCount++;
                        } else {
                            throw err;
                        }
                    }
                }
            }
        }

        const remainingItems = fs.readdirSync(sourcePath);
        if (remainingItems.length === 0) {
            fs.rmdirSync(sourcePath);
        }

        return { success: true, moved: movedCount };
    } catch (e) {
        console.error("Error sending to Ya subido:", e);
        return { success: false, error: e.message };
    }
});
