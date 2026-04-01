const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

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
        // Open DevTools in development
        mainWindow.webContents.openDevTools();
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

// NFC Serial Port Management
let nfcPort = null;
let nfcParser = null;

// List available serial ports
async function listSerialPorts() {
    try {
        const ports = await SerialPort.list();
        return ports.map(port => ({
            path: port.path,
            manufacturer: port.manufacturer,
            serialNumber: port.serialNumber,
            vendorId: port.vendorId,
            productId: port.productId
        }));
    } catch (error) {
        console.error('Error listing serial ports:', error);
        return [];
    }
}

// Connect to NFC reader
function connectNFCReader(portPath) {
    try {
        // Close existing connection if any
        if (nfcPort && nfcPort.isOpen) {
            nfcPort.close();
        }

        nfcPort = new SerialPort({
            path: portPath,
            baudRate: 115200,
            autoOpen: false
        });

        nfcParser = nfcPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

        nfcPort.open((err) => {
            if (err) {
                console.error('Error opening NFC port:', err);
                if (mainWindow) {
                    mainWindow.webContents.send('nfc:error', err.message);
                }
                return;
            }

            console.log('NFC Reader connected on', portPath);
            if (mainWindow) {
                mainWindow.webContents.send('nfc:connected', portPath);
            }
        });

        // Listen for NFC card UIDs
        nfcParser.on('data', (data) => {
            const uid = data.trim();
            if (uid && /^[0-9A-F]+$/i.test(uid)) {
                console.log('NFC Card detected:', uid);
                if (mainWindow) {
                    mainWindow.webContents.send('nfc:card-detected', uid);
                }
            }
        });

        nfcPort.on('error', (err) => {
            console.error('NFC Port error:', err);
            if (mainWindow) {
                mainWindow.webContents.send('nfc:error', err.message);
            }
        });

        nfcPort.on('close', () => {
            console.log('NFC Reader disconnected');
            if (mainWindow) {
                mainWindow.webContents.send('nfc:disconnected');
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Error connecting to NFC reader:', error);
        return { success: false, error: error.message };
    }
}

// Disconnect NFC reader
function disconnectNFCReader() {
    if (nfcPort && nfcPort.isOpen) {
        nfcPort.close();
        return { success: true };
    }
    return { success: false, error: 'No active connection' };
}

// IPC Handlers for NFC
ipcMain.handle('nfc:list-ports', async () => {
    return await listSerialPorts();
});

ipcMain.handle('nfc:connect', async (event, portPath) => {
    return connectNFCReader(portPath);
});

ipcMain.handle('nfc:disconnect', async () => {
    return disconnectNFCReader();
});

// Auto-connect to Arduino on startup (optional)
app.whenReady().then(async () => {
    // Wait a bit for the window to be ready
    setTimeout(async () => {
        const ports = await listSerialPorts();
        // Try to find Arduino (common vendor IDs: 0x2341 for Arduino, 0x1A86 for CH340)
        const arduinoPort = ports.find(p => 
            p.vendorId === '2341' || 
            p.vendorId === '1A86' ||
            p.manufacturer?.toLowerCase().includes('arduino')
        );
        
        if (arduinoPort) {
            console.log('Auto-connecting to Arduino on', arduinoPort.path);
            connectNFCReader(arduinoPort.path);
        }
    }, 2000);
});