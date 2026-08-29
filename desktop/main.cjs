const { app, BrowserWindow, dialog, ipcMain, Menu, Tray, nativeImage } = require('electron');
const fs = require('node:fs');
const path = require('node:path');

let mainWindow = null;
let tray = null;
let watchedRoot = null;
let watcher = null;
let pollTimer = null;
const known = new Map();

const supported = new Set(['.pdf','.xlsx','.xls','.csv','.docx','.doc','.txt','.tsv','.ods','.json','.jsonl','.xml','.md','.markdown','.rtf','.jpg','.jpeg','.png','.webp','.tiff','.bmp']);

function isSupported(filePath) { return supported.has(path.extname(filePath).toLowerCase()); }
function statKey(filePath, stat) { return `${filePath}:${stat.size}:${stat.mtimeMs}`; }

function walk(root) {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && isSupported(full)) out.push(full);
    }
  }
  return out.sort((a,b) => a.localeCompare(b, undefined, { numeric: true }));
}

function emitFile(filePath, reason = 'changed') {
  if (!mainWindow || !fs.existsSync(filePath) || !isSupported(filePath)) return;
  let stat;
  try { stat = fs.statSync(filePath); } catch { return; }
  const key = statKey(filePath, stat);
  if (known.get(filePath) === key) return;
  known.set(filePath, key);
  mainWindow.webContents.send('desktop-folder-watch:file', { path: filePath, reason, size: stat.size, modifiedAt: new Date(stat.mtimeMs).toISOString() });
}

function rescan() {
  if (!watchedRoot) return;
  const current = new Set(walk(watchedRoot));
  for (const filePath of current) emitFile(filePath, 'scan');
  for (const filePath of [...known.keys()]) {
    if (filePath.startsWith(watchedRoot + path.sep) && !current.has(filePath)) {
      known.delete(filePath);
      mainWindow?.webContents.send('desktop-folder-watch:deleted', { path: filePath });
    }
  }
}

function stopWatch() {
  watcher?.close(); watcher = null;
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = null;
  watchedRoot = null;
  known.clear();
}

function startWatch(root) {
  stopWatch();
  watchedRoot = path.resolve(root);
  rescan();
  try {
    watcher = fs.watch(watchedRoot, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const full = path.resolve(watchedRoot, filename.toString());
      setTimeout(() => emitFile(full, 'filesystem'), 1200);
    });
    watcher.on('error', () => { watcher = null; });
  } catch {
    watcher = null;
  }
  // Polling remains as the fail-safe for network/removable drives and missed native events.
  pollTimer = setInterval(rescan, 30000);
  return watchedRoot;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1100,
    minHeight: 700,
    show: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) mainWindow.loadURL(devUrl);
  else mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));

  mainWindow.on('close', (event) => {
    if (app.isQuitting) return;
    event.preventDefault();
    mainWindow.hide();
  });
}

app.whenReady().then(() => {
  ipcMain.handle('desktop-folder-watch:select', async () => {
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    if (result.canceled || !result.filePaths[0]) return null;
    return { path: result.filePaths[0], name: path.basename(result.filePaths[0]) };
  });
  ipcMain.handle('desktop-folder-watch:start', (_event, root) => startWatch(root));
  ipcMain.handle('desktop-folder-watch:stop', () => { stopWatch(); return true; });
  ipcMain.handle('desktop-folder-watch:read-file', async (_event, filePath) => {
    if (!watchedRoot) throw new Error('WATCH_FOLDER_NOT_ACTIVE');
    const resolved = path.resolve(filePath);
    const relative = path.relative(watchedRoot, resolved);
    if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw new Error('WATCH_FOLDER_PATH_OUTSIDE_ROOT');
    if (!fs.existsSync(resolved) || !isSupported(resolved)) throw new Error('WATCH_FILE_NOT_AVAILABLE');
    return fs.promises.readFile(resolved);
  });

  tray = new Tray(nativeImage.createEmpty());
  tray.setToolTip('Report-Advisor');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'فتح Report-Advisor', click: () => mainWindow?.show() },
    { label: 'إيقاف مراقبة المجلد', click: () => stopWatch() },
    { label: 'خروج', click: () => { app.isQuitting = true; stopWatch(); app.quit(); } },
  ]));
  tray.on('double-click', () => mainWindow?.show());

  createWindow();
});

app.on('window-all-closed', (event) => event.preventDefault());
app.on('before-quit', () => { app.isQuitting = true; stopWatch(); });
app.on('activate', () => mainWindow?.show());
