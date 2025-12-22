const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

// Better development detection
const isDev = process.env.NODE_ENV === 'development' || 
              process.argv.includes('--dev') || 
              !app.isPackaged;

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'Medical Management System',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, '../public/favicon.ico'),
        show: false,
        titleBarStyle: 'default'
    });

    // Load the app
    if (isDev) {
        console.log('Development mode: Loading from Vite dev server...');
        mainWindow.loadURL('http://localhost:5173');
        // Open DevTools in development (commented out to avoid DevTools errors)
        // mainWindow.webContents.openDevTools();
    } else {
        console.log('Production mode: Loading from dist folder...');
        const indexPath = path.join(__dirname, '../dist/index.html');
        if (fs.existsSync(indexPath)) {
            mainWindow.loadFile(indexPath);
        } else {
            console.error('dist/index.html not found. Run "npm run build" first.');
            // Fallback to dev server if dist doesn't exist
            mainWindow.loadURL('http://localhost:5173');
        }
    }

    // Show window when ready to prevent visual flash
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    // Create application menu
    createMenu();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

function createMenu() {
    // Remove the menu bar (File, View, Window)
    Menu.setApplicationMenu(null);
}