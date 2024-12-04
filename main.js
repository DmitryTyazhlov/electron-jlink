const electron = require('electron');
const { app, BrowserWindow, ipcMain } = electron;
const path = require('path');
const jlinkModule = require('@connectedyard/node-jlink');

let mainWindow = null;
let jlink = null;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 600,
    height: 800,
    minWidth: 600,
    minHeight: 800,
    backgroundColor: '#f0f0f0',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    title: 'Electron JLink'
  })

  mainWindow.loadFile('index.html')
  mainWindow.webContents.openDevTools()
}

const setupIPC = () => {
  ipcMain.handle('jlink:eraseAll', async (event, device) => {
    try {
      console.log('Using JLink for device:', device);
      
      if (!jlink) {
        if (!await jlinkModule.isJLinkEXEInstalled()) {
          throw new Error('JLink software is not installed. Please install JLink software from SEGGER website.');
        }
        jlink = jlinkModule;
      }
      
      // Установим опции для J-Link
      await jlink.setJLinkEXEOptions([
        '-device', device,
        '-speed', '4000',
        '-if', 'SWD',
        '-autoconnect', '1'
      ]);
      
      console.log('Erasing device...');
      await jlink.eraseAll();
      console.log('Erase completed');
      
      return { success: true, message: `Successfully erased ${device}` };
    } catch (error) {
      console.error('Error in jlink:eraseAll:', error);
      return { success: false, message: `Error erasing device: ${error.message}` };
    }
  });

  ipcMain.handle('jlink:program', async (event, { device, filePath }) => {
    try {
      console.log('Using JLink for device:', device);
      
      if (!jlink) {
        if (!await jlinkModule.isJLinkEXEInstalled()) {
          throw new Error('JLink software is not installed. Please install JLink software from SEGGER website.');
        }
        jlink = jlinkModule;
      }
      
      // Установим опции для J-Link
      await jlink.setJLinkEXEOptions([
        '-device', device,
        '-speed', '4000',
        '-if', 'SWD',
        '-autoconnect', '1'
      ]);
      
      console.log('Programming device with file:', filePath);
      await jlink.program(filePath);
      console.log('Programming completed');
      
      return { success: true, message: `Successfully programmed ${device}` };
    } catch (error) {
      console.error('Error in jlink:program:', error);
      return { success: false, message: `Error programming device: ${error.message}` };
    }
  });
}

electron.app.whenReady().then(() => {
  setupIPC();
  createWindow();

  electron.app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});
