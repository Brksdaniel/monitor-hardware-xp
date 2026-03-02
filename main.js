const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let lhmProcess = null;
let mainWindow = null;

const lhmPath = app.isPackaged
  ? path.join(process.resourcesPath, 'lhm', 'LibreHardwareMonitor.exe')
  : path.join(__dirname, 'lhm', 'LibreHardwareMonitor.exe');

function iniciarLHM() {
  return new Promise((resolve) => {
    lhmProcess = spawn('powershell', [
      '-Command',
      `Start-Process '${lhmPath}' -ArgumentList '--minimized' -Verb RunAs -WindowStyle Hidden`
    ], { shell: true });
    setTimeout(resolve, 4000);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    title: 'Monitor de Hardware XP'
  });

  setTimeout(() => {
    mainWindow.loadURL('http://localhost:3000');
  }, 1500);
}

// Controles da janela via IPC
ipcMain.on('fechar', () => {
  spawn('powershell', ['-Command', 'Stop-Process -Name "LibreHardwareMonitor" -Force -ErrorAction SilentlyContinue'], { shell: true });
  setTimeout(() => app.quit(), 1000);
});
ipcMain.on('minimizar', () => mainWindow.minimize());
ipcMain.on('maximizar', () => {
  mainWindow.isMaximized() ? mainWindow.unmaximize() : mainWindow.maximize();
});

app.whenReady().then(async () => {
  await iniciarLHM();
  require('./servidor.js');
  setTimeout(createWindow, 1500);
});

app.on('window-all-closed', () => {
  spawn('powershell', ['-Command', 'Stop-Process -Name "LibreHardwareMonitor" -Force -ErrorAction SilentlyContinue'], { shell: true });
  setTimeout(() => app.quit(), 1000);
});