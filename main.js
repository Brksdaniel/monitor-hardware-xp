const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let lhmProcess = null;

// Caminho do LibreHardwareMonitor
const lhmPath = app.isPackaged
  ? path.join(process.resourcesPath, 'lhm', 'LibreHardwareMonitor.exe')
  : path.join(__dirname, 'lhm', 'LibreHardwareMonitor.exe');

function iniciarLHM() {
  return new Promise((resolve) => {
    console.log('🔄 Iniciando LibreHardwareMonitor...');
    
    lhmProcess = spawn('powershell', [
  '-Command',
  `Start-Process '${lhmPath}' -ArgumentList '--minimized' -Verb RunAs -WindowStyle Hidden`
], {
  shell: true
});

    // Aguarda 4 segundos pra ele subir
    setTimeout(resolve, 4000);
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    webPreferences: { nodeIntegration: true },
    title: 'Monitor de Hardware XP'
  });

  win.loadURL('http://localhost:3000');
}

app.whenReady().then(async () => {
  await iniciarLHM();
  require('./servidor.js');
  
  setTimeout(() => {
    createWindow();
  }, 1500);
});

app.on('window-all-closed', () => {
  // Fecha o LibreHardwareMonitor pelo nome do processo
  spawn('powershell', [
    '-Command',
    'Stop-Process -Name "LibreHardwareMonitor" -Force -ErrorAction SilentlyContinue'
  ], { shell: true });

  setTimeout(() => {
    app.quit();
  }, 1000);
});