// Preload script - Bridge between Electron and React
const { contextBridge, ipcRenderer } = require('electron');

console.log('==== PRELOAD SCRIPT LOADED ====');
console.log('Exposing electron APIs to window.electron');

// Expose protected methods that allow the renderer process to use
// IPC to access Node.js APIs safely through the main process
contextBridge.exposeInMainWorld('electron', {
  isElectron: true, // Flag to detect Electron environment
  
  // File system operations - all go through IPC to main process
  fs: {
    readFileSync: (filePath, encoding) => ipcRenderer.sendSync('fs-read-file', filePath, encoding),
    writeFileSync: (filePath, data, encoding) => ipcRenderer.sendSync('fs-write-file', filePath, data, encoding),
    existsSync: (filePath) => ipcRenderer.sendSync('fs-exists', filePath),
    mkdirSync: (dirPath, options) => ipcRenderer.sendSync('fs-mkdir', dirPath, options),
  },
  
  // Path operations - through IPC
  path: {
    join: (...args) => ipcRenderer.sendSync('path-join', args),
    dirname: (filePath) => ipcRenderer.sendSync('path-dirname', filePath),
  },
  
  // App information
  app: {
    getPath: (name) => {
      // Return app paths
      return ipcRenderer.sendSync('get-app-path', name);
    },
    getAppPath: () => {
      // Return the application installation directory
      return ipcRenderer.sendSync('get-app-path', 'exe');
    },
  },
  
  // Dialog operations for import/export
  dialog: {
    showSaveDialog: async (options) => {
      return await ipcRenderer.invoke('show-save-dialog', options);
    },
    showOpenDialog: async (options) => {
      return await ipcRenderer.invoke('show-open-dialog', options);
    },
  },
});

console.log('==== ELECTRON APIS EXPOSED ====');
console.log('window.electron should now be available in renderer');
