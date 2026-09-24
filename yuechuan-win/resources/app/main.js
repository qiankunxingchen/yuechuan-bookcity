const { app, BrowserWindow, shell, Menu } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    title: '阅川书城',
    backgroundColor: '#F5F0E4',
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile(path.join(__dirname, 'index.html'));

  // F11 切换全屏
  win.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
    }
    if (input.key === 'Escape' && win.isFullScreen()) {
      win.setFullScreen(false);
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

Menu.setApplicationMenu(null);
