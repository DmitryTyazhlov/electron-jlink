const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
    'jlink', {
        eraseDevice: (device) => {
            console.log('Calling eraseDevice with device:', device);
            return ipcRenderer.invoke('jlink:eraseAll', device);
        },
        flashDevice: (device, filePath) => {
            console.log('Calling flashDevice with:', device, filePath);
            return ipcRenderer.invoke('jlink:program', { device, filePath });
        },
        listDevices: () => {
            return ipcRenderer.invoke('jlink:list-devices');
        }
    }
)
