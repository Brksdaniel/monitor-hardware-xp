const { app, BrowserWindow } = require('electron');
const path = require('path');

// Importa o servidor
require('./servidor.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 800,
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: { nodeIntegration: true },
    title: 'Monitor de Hardware XP'
  });

  // Aguarda o servidor subir e abre
  setTimeout(() => {
    win.loadURL('http://localhost:3000');
  }, 1500);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});