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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      return res.end();
    }

    if (req.method === 'POST' && req.url.startsWith('/trigger-macro')) {
      const parsedUrl = new URL(req.url, 'http://127.0.0.1');
      const x = parsedUrl.searchParams.get('x') || 960;
      const y = parsedUrl.searchParams.get('y') || 540;

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ok: true}));
      
      const { exec } = require('child_process');
      const fs = require('fs');
      const path = require('path');
      const psCode = `
Add-Type -AssemblyName System.Windows.Forms
Add-Type -TypeDefinition '
using System;
using System.Runtime.InteropServices;
public class Win32 {
    [DllImport("user32.dll")] public static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, int dwExtraInfo);
}
'

# Save the .rar path before anything else
$rarPath = [System.Windows.Forms.Clipboard]::GetText()

# Step 1: Click the transparent overlay to open the file dialog
[System.Windows.Forms.Cursor]::Position = New-Object System.Drawing.Point(${x}, ${y})
Start-Sleep -Milliseconds 200
[Win32]::mouse_event(0x02, 0, 0, 0, 0)
[Win32]::mouse_event(0x04, 0, 0, 0, 0)

# Step 2: Wait for the file dialog to fully appear
Start-Sleep -Milliseconds 3500

# Step 3: Focus the "File name" / "Nombre de archivo" field (Alt+N)
[System.Windows.Forms.SendKeys]::SendWait("%n")
Start-Sleep -Milliseconds 400

# Step 4: Clear whatever is in the field
[System.Windows.Forms.SendKeys]::SendWait("^a")
Start-Sleep -Milliseconds 100
[System.Windows.Forms.SendKeys]::SendWait("{DEL}")
Start-Sleep -Milliseconds 200

# Step 5: Paste the full .rar absolute path
[System.Windows.Forms.Clipboard]::SetText($rarPath)
[System.Windows.Forms.SendKeys]::SendWait("^v")
Start-Sleep -Milliseconds 600

# Step 6: Press Enter to select the file and upload
[System.Windows.Forms.SendKeys]::SendWait("{ENTER}")
      `.trim();
      const tmpPath = path.join(require('os').tmpdir(), 'post_away_upload.ps1');
      fs.writeFileSync(tmpPath, psCode);
      exec(`powershell -Sta -ExecutionPolicy Bypass -WindowStyle Hidden -File "${tmpPath}"`, (err) => {
          if (err) console.error("PS Auto-Upload Error:", err);
      });
      return;
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
          folderName, 
          path: subPath, 
          character, 
          characterJP, 
          anime, 
          animeJP, 
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

// Broadcast payload to SSE Clients
ipcMain.handle('fill-patreon', (event, data) => {
  const payload = JSON.stringify(data);
  sseClients.forEach(res => res.write(`data: ${payload}\n\n`));
  return { success: true, receivers: sseClients.length };
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
