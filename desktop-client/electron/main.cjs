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
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js'),
            // Enable media permissions for microphone access
            allowRunningInsecureContent: false,
            experimentalFeatures: true,
            // Enable web security for proper speech recognition
            webSecurity: true,
            // Enable media stream for microphone access
            enableBlinkFeatures: 'MediaStreamTrack'
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

    // Handle media permissions - more comprehensive approach
    mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
        console.log('Permission requested:', permission);
        
        // Allow microphone and media access for speech recognition
        const allowedPermissions = ['microphone', 'media', 'audioCapture', 'camera'];
        if (allowedPermissions.includes(permission)) {
            callback(true);
        } else {
            callback(false);
        }
    });

    // Handle permission check requests
    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
        console.log('Permission check:', permission, 'from:', requestingOrigin);
        
        // Allow microphone and media access
        const allowedPermissions = ['microphone', 'media', 'audioCapture'];
        if (allowedPermissions.includes(permission)) {
            return true;
        }
        return false;
    });

    // Set media device access
    mainWindow.webContents.session.setDevicePermissionHandler((details) => {
        console.log('Device permission requested:', details);
        if (details.deviceType === 'microphone') {
            return true;
        }
        return false;
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
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}