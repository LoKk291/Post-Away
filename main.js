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
        try {
          const files = fs.readdirSync(subPath);
          const ext = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
          const imageFiles = files.filter(f => ext.includes(path.extname(f).toLowerCase()));
          imagesCount = imageFiles.length;
          if (imageFiles.length > 0) {
            thumbnail = "file://" + path.join(subPath, imageFiles[0]).replace(/\\/g, '/');
            imagePaths = imageFiles.map(f => path.join(subPath, f));
          }
        } catch(e) {}

        const title = `${character} - ${imagesCount} Pics - [${anime}]`;
        const tags = `${character}, ${anime}`;

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
          imagePaths
        });
      }
    }
    return posts;
  } catch(e) {
    console.error(e);
    return [];
  }
});

// Broadcast payload to SSE Clients or prepare for polling
ipcMain.handle('fill-patreon', (event, data) => {
  const isPollingActive = (Date.now() - lastPollTime < 4000);
  if (isPollingActive) {
    currentPayload = data;
  }
  const payload = JSON.stringify(data);
  sseClients.forEach(res => res.write(`data: ${payload}\n\n`));
  return { success: true, receivers: sseClients.length + (isPollingActive ? 1 : 0) };
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

ipcMain.handle('fetch-patreon-links', async (event, creatorUrl, posts) => {
  const { net } = require('electron');
  
  const fetchText = (url) => {
    return new Promise((resolve, reject) => {
      const request = net.request(url);
      request.on('response', (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => { resolve({ text: data, status: response.statusCode }); });
      });
      request.on('error', (error) => { reject(error); });
      request.end();
    });
  };

  try {
    let cleanUrl = creatorUrl.trim();
    if (!cleanUrl.startsWith('http')) cleanUrl = 'https://' + cleanUrl;
    
    const { text: html, status } = await fetchText(cleanUrl);
    if (status >= 400) {
        return { success: false, error: `Error HTTP ${status} al cargar la URL del creador.` };
    }
    
    let campaignId = null;
    let match = html.match(/"campaign_id"\s*:\s*"?(\d+)"?/) || 
                html.match(/"campaign":\s*\{\s*"data":\s*\{\s*"id":\s*"(\d+)"/) ||
                html.match(/https:\/\/www\.patreon\.com\/api\/campaigns\/(\d+)/) ||
                html.match(/"creator_id":\s*"?(\d+)"?/) ||
                html.match(/campaign_id[=":\s]+(\d+)/);

    if (match) campaignId = match[1];

    if (!campaignId) {
        return { success: false, error: 'No se pudo detectar el ID de la campaña en la página. Verifica que el Link de Patreon sea correcto (ej: https://www.patreon.com/lokk291).' };
    }

    const apiUrl = `https://www.patreon.com/api/posts?include=campaign&filter[campaign_id]=${campaignId}&sort=-published_at&page[count]=50&json-api-version=1.0`;
    const { text: postsJsonText } = await fetchText(apiUrl);
    
    let postsData;
    try {
        postsData = JSON.parse(postsJsonText);
    } catch(e) {
        return { success: false, error: 'Error parseando JSON de la API de Patreon.' };
    }

    if (!postsData || !postsData.data) {
        return { success: false, error: 'La API de Patreon no devolvió datos válidos.' };
    }

    const patreonPosts = postsData.data.map(p => {
        return {
            title: (p.attributes.title || '').toLowerCase(),
            url: p.attributes.url || `https://www.patreon.com/posts/${p.id}`,
            publishedAt: new Date(p.attributes.published_at || 0)
        };
    });

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

    return { success: true, links: matchedLinks };
  } catch (err) {
    console.error("Error fetching Patreon links:", err);
    return { success: false, error: err.message };
  }
});

