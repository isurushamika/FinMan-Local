// Electron Main Process
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  console.log('Creating Electron window...');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Determine preload script path (handles both dev and production)
  const preloadPath = app.isPackaged
    ? path.join(process.resourcesPath, 'app.asar', 'preload.js')
    : path.join(__dirname, 'preload.js');
  
  console.log('Preload path:', preloadPath);
  
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    icon: path.join(__dirname, 'public/vite.svg'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      preload: preloadPath,
    },
    backgroundColor: '#f9fafb',
    show: false, // Don't show until ready
  });

  // Load the app
  if (process.env.NODE_ENV === 'development') {
    const url = 'http://localhost:5173';
    console.log('Loading development URL:', url);
    mainWindow.loadURL(url).catch(err => {
      console.error('Failed to load URL:', err);
    });
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else {
    const filePath = path.join(__dirname, 'dist/index.html');
    console.log('Loading production file:', filePath);
    mainWindow.loadFile(filePath).catch(err => {
      console.error('Failed to load file:', err);
    });
  }
  
  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription);
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Create application menu
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About FinMan',
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'About FinMan',
              message: 'FinMan - Personal Finance Manager',
              detail: 'Version 1.0.0\n\nOffline-first personal finance management.\nAll your data stays on your device.\n\n© 2025 FinMan'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers

// File system operations
ipcMain.on('fs-read-file', (event, filePath, encoding) => {
  try {
    event.returnValue = fs.readFileSync(filePath, encoding);
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

ipcMain.on('fs-write-file', (event, filePath, data, encoding) => {
  try {
    fs.writeFileSync(filePath, data, encoding);
    event.returnValue = { success: true };
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

ipcMain.on('fs-exists', (event, filePath) => {
  event.returnValue = fs.existsSync(filePath);
});

ipcMain.on('fs-mkdir', (event, dirPath, options) => {
  try {
    fs.mkdirSync(dirPath, options);
    event.returnValue = { success: true };
  } catch (error) {
    event.returnValue = { error: error.message };
  }
});

// Path operations
ipcMain.on('path-join', (event, args) => {
  event.returnValue = path.join(...args);
});

ipcMain.on('path-dirname', (event, filePath) => {
  event.returnValue = path.dirname(filePath);
});

// App path
ipcMain.on('get-app-path', (event, name) => {
  if (name === 'exe') {
    // Return the directory where the executable is located
    const exePath = app.getPath('exe');
    event.returnValue = path.dirname(exePath);
  } else {
    event.returnValue = app.getPath(name);
  }
});

// Dialog operations
ipcMain.handle('show-save-dialog', async (event, options) => {
  const { dialog } = require('electron');
  return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const { dialog } = require('electron');
  return await dialog.showOpenDialog(mainWindow, options);
});

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Prevent navigation to external URLs
app.on('web-contents-created', (event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    
    // Allow localhost in development
    if (process.env.NODE_ENV === 'development' && parsedUrl.hostname === 'localhost') {
      return;
    }
    
    // Block all other navigation
    if (parsedUrl.origin !== 'file://') {
      event.preventDefault();
    }
  });
});
