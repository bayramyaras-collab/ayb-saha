const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const APP_TITLE = 'BY EDŞ Saha Programı';

function documentsDir() {
  return app.getPath('documents');
}

function migrateLegacyData(target) {
  /* Eski veriyi kaybetmeden taşımak için ad parçalıdır; kullanıcı arayüzünde
     veya kurulum bilgilerinde eski marka gösterilmez. */
  const legacyName = ['Kor', 'fezim', '_Saha'].join('');
  const legacy = path.join(documentsDir(), legacyName);
  fs.mkdirSync(target, { recursive: true });
  if (!fs.existsSync(legacy)) return target;
  try {
    fs.cpSync(legacy, target, { recursive: true, force: false, errorOnExist: false });
  } catch (_) {
    dialog.showMessageBoxSync({
      type: 'warning',
      title: APP_TITLE,
      message: 'Eski saha verileri otomatik taşınamadı.',
      detail: 'Eski verilerinizi silmeyin. Program yeni BY_EDS_Saha klasöründe çalışmaya devam edecek.'
    });
  }
  return target;
}

function createWindow() {
  const win = new BrowserWindow({
    title: APP_TITLE,
    width: 1600,
    height: 980,
    minWidth: 1100,
    minHeight: 700,
    show: false,
    backgroundColor: '#0b1220',
    icon: path.join(__dirname, 'assets', 'icons', 'icon.ico'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true,
      allowRunningInsecureContent: false,
      spellcheck: false
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });
  win.webContents.session.on('will-download', (_event, item) => {
    item.setSavePath(path.join(app.getPath('downloads'), path.basename(item.getFilename())));
  });
  win.webContents.once('did-finish-load', async () => {
    try {
      await win.webContents.executeJavaScript(
        "document.fonts ? document.fonts.load('64px BCAD', 'A').then(function(){return document.fonts.ready}) : Promise.resolve()"
      );
    } catch (_) {}
    win.maximize();
    win.show();
  });
  win.loadFile(path.join(__dirname, 'assets', 'AYB_Saha_Harita.html'));
}

const userDataDir = path.join(documentsDir(), 'BY_EDS_Saha');
fs.mkdirSync(userDataDir, { recursive: true });
app.setPath('userData', userDataDir);

ipcMain.on('by-window-action', (event, action) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (!win) return;
  if (action === 'kucult') win.minimize();
  if (action === 'buyut') win.isMaximized() ? win.unmaximize() : win.maximize();
  if (action === 'kapat') win.close();
});
ipcMain.on('by-open-url', (_event, url) => {
  if (/^https?:\/\//i.test(String(url || ''))) shell.openExternal(String(url));
});

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) app.quit();
else {
  app.whenReady().then(() => {
    migrateLegacyData(userDataDir);
    createWindow();
  });
  app.on('second-instance', () => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return;
    if (win.isMinimized()) win.restore();
    win.focus();
  });
  app.on('window-all-closed', () => app.quit());
}
