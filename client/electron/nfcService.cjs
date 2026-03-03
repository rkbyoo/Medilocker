const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')
const { ipcMain } = require('electron')

class NFCService {
  constructor() {
    this.port = null
    this.parser = null
    this.isConnected = false
    this.currentPortPath = null
    this.lastUid = null
    this.reconnectTimer = null
    this.mainWindow = null
    this.RECONNECT_INTERVAL = 3000
    this.BAUD_RATE = 115200
  }

  setMainWindow(window) {
    this.mainWindow = window
  }

  async start() {
    console.log('[NFC] Starting NFC service...')
    await this.tryConnect()
  }

  stop() {
    console.log('[NFC] Stopping NFC service...')
    this.clearReconnectTimer()
    this.disconnect()
  }

  async tryConnect() {
    if (this.isConnected) {
      return
    }

    try {
      const ports = await SerialPort.list()
      console.log('[NFC] Available ports:', ports.map(p => `${p.path} (${p.manufacturer || 'unknown'})`).join(', '))

      const arduinoPort = this.findArduinoPort(ports)

      if (!arduinoPort) {
        console.log('[NFC] No Arduino device found, retrying in', this.RECONNECT_INTERVAL, 'ms...')
        this.scheduleReconnect()
        return
      }

      console.log(`[NFC] Found Arduino on ${arduinoPort.path}`)
      await this.connect(arduinoPort.path)
    } catch (error) {
      console.error('[NFC] Error scanning ports:', error.message)
      this.scheduleReconnect()
    }
  }

  findArduinoPort(ports) {
    const arduinoPatterns = [
      { pattern: /arduino/i, name: 'manufacturer match' },
      { pattern: /ttyACM/i, name: 'Linux ttyACM' },
      { pattern: /ttyUSB/i, name: 'Linux ttyUSB' },
      { pattern: /cu\.usbmodem/i, name: 'macOS usbmodem' },
      { pattern: /cu\.usbserial/i, name: 'macOS usbserial' },
      { pattern: /^COM\d+$/i, name: 'Windows COM' }
    ]

    for (const { pattern, name } of arduinoPatterns) {
      const match = ports.find(port => pattern.test(port.path) || pattern.test(port.manufacturer || ''))
      if (match) {
        console.log(`[NFC] Detected Arduino by ${name}: ${match.path}`)
        return match
      }
    }

    return null
  }

  async connect(portPath) {
    try {
      console.log(`[NFC] Connecting to ${portPath} at ${this.BAUD_RATE} baud...`)

      this.port = new SerialPort({
        path: portPath,
        baudRate: this.BAUD_RATE,
        autoOpen: false
      })

      await new Promise((resolve, reject) => {
        this.port.open((err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }))
      this.setupParserListeners()
      this.setupPortListeners()

      this.isConnected = true
      this.currentPortPath = portPath
      this.lastUid = null
      
      console.log(`[NFC] Successfully connected to ${portPath}`)
      this.emitStatus()

    } catch (error) {
      console.error(`[NFC] Failed to connect to ${portPath}:`, error.message)
      this.disconnect()
      this.scheduleReconnect()
    }
  }

  setupParserListeners() {
    this.parser.on('data', (data) => {
      const uid = data.trim().replace(/\r/g, '')
      
      if (!uid) {
        return
      }

      if (!this.isValidUid(uid)) {
        console.log(`[NFC] Invalid UID received: "${uid}"`)
        return
      }

      if (uid === this.lastUid) {
        return
      }

      this.lastUid = uid
      console.log(`[NFC] Card detected: ${uid}`)
      this.emitCardDetected(uid)
    })
  }

  setupPortListeners() {
    this.port.on('close', () => {
      console.log('[NFC] Port closed')
      this.handleDisconnect()
    })

    this.port.on('error', (error) => {
      console.error('[NFC] Port error:', error.message)
      this.handleDisconnect()
    })

    this.port.on('disconnect', () => {
      console.log('[NFC] Port disconnected')
      this.handleDisconnect()
    })
  }

  isValidUid(uid) {
    return /^[0-9A-Fa-f]{8,14}$/.test(uid)
  }

  handleDisconnect() {
    if (this.isConnected) {
      console.log('[NFC] Device disconnected')
      this.disconnect()
      this.scheduleReconnect()
    }
  }

  disconnect() {
    this.isConnected = false
    this.currentPortPath = null
    this.lastUid = null

    if (this.parser) {
      this.parser.removeAllListeners()
      this.parser = null
    }

    if (this.port) {
      this.port.removeAllListeners()
      if (this.port.isOpen) {
        this.port.close((err) => {
          if (err) console.error('[NFC] Error closing port:', err.message)
        })
      }
      this.port = null
    }

    this.emitStatus()
  }

  scheduleReconnect() {
    this.clearReconnectTimer()
    console.log(`[NFC] Scheduling reconnect in ${this.RECONNECT_INTERVAL}ms...`)
    this.reconnectTimer = setTimeout(() => {
      this.tryConnect()
    }, this.RECONNECT_INTERVAL)
  }

  clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
  }

  emitStatus() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('nfc:status', {
        connected: this.isConnected,
        port: this.currentPortPath,
        error: this.isConnected ? null : 'Device not connected'
      })
    }
  }

  emitCardDetected(uid) {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('nfc:card', {
        uid: uid.toUpperCase(),
        timestamp: Date.now()
      })
    }
  }

  getStatus() {
    return {
      connected: this.isConnected,
      port: this.currentPortPath,
      error: this.isConnected ? null : 'Device not connected'
    }
  }

  async manualReconnect() {
    console.log('[NFC] Manual reconnect requested')
    this.disconnect()
    this.clearReconnectTimer()
    await this.tryConnect()
  }
}

const nfcService = new NFCService()

ipcMain.handle('nfc:getStatus', () => {
  return nfcService.getStatus()
})

ipcMain.handle('nfc:reconnect', async () => {
  await nfcService.manualReconnect()
  return nfcService.getStatus()
})

module.exports = { nfcService }
