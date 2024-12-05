const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'jlink', {
        eraseDevice: (device, connection) => {
            console.log('Calling eraseDevice with:', device, connection);
            return ipcRenderer.invoke('jlink:eraseAll', { device, connection });
        },
        flashDevice: (device, filePath, connection) => {
            console.log('Calling flashDevice with:', device, filePath, connection);
            return ipcRenderer.invoke('jlink:program', { device, filePath, connection });
        },
        listDevices: () => {
            return ipcRenderer.invoke('jlink:list-devices');
        }
    }
)
