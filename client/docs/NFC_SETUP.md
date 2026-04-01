# NFC Reader Setup Guide

## Overview

This guide explains how to integrate the Arduino NFC reader with the Electron desktop application.

## Hardware Requirements

- Arduino board (Uno, Nano, Mega, etc.)
- PN532 NFC Reader Module (I2C connection)
- USB cable to connect Arduino to computer
- NFC cards (ISO14443A compatible)

## Arduino Setup

### 1. Wiring (I2C Connection)

Connect PN532 to Arduino:
- VCC → 5V
- GND → GND
- SDA → A4 (Uno/Nano) or SDA pin
- SCL → A5 (Uno/Nano) or SCL pin

### 2. Install Arduino Libraries

In Arduino IDE, install these libraries via Library Manager:
- `Adafruit PN532` by Adafruit

### 3. Upload the Code

Upload the provided Arduino sketch to your board. The code:
- Initializes PN532 in I2C mode
- Reads NFC card UIDs continuously
- Sends UIDs via Serial at 115200 baud
- Prevents duplicate reads with debouncing

## Desktop App Integration

### How It Works

```
NFC Card → Arduino (PN532) → USB Serial → Electron Main Process → IPC → React Component → API Search
```

### Architecture

1. **Arduino Layer**: Reads NFC UID and sends via Serial (115200 baud)
2. **Electron Main Process**: Uses `serialport` package to listen to USB
3. **IPC Bridge**: Preload script exposes NFC API to renderer
4. **React Component**: Receives UID and triggers patient search

### Auto-Connection

The app automatically tries to connect to Arduino on startup by:
- Scanning all serial ports
- Looking for Arduino vendor IDs (0x2341, 0x1A86)
- Auto-connecting if found

### Manual Connection

If auto-connection fails:
1. Click "Scan NFC Card" button
2. Select your Arduino's COM port from dropdown
3. Click "Connect & Scan"
4. Place NFC card near reader

## Usage in Receptionist Dashboard

### Patient Lookup Flow

1. Navigate to "Existing Patient" section
2. Click "Scan NFC Card" button
3. System shows available serial ports
4. Select Arduino port and click "Connect & Scan"
5. Place NFC card near reader
6. UID is automatically captured and patient is searched
7. If found, patient details and appointment booking form appear

### Status Indicators

- **Green WiFi Icon**: NFC reader connected and ready
- **Gray WiFi Off Icon**: NFC reader not connected
- **Pulsing NFC Icon**: Waiting for card scan

## Troubleshooting

### Arduino Not Detected

- Check USB cable connection
- Install CH340 drivers (for clone boards)
- Verify Arduino appears in Device Manager (Windows) or `ls /dev/tty*` (Mac/Linux)
- Try different USB port

### No Card Detection

- Verify PN532 wiring (especially I2C pins)
- Check Serial Monitor in Arduino IDE (should show UIDs at 115200 baud)
- Ensure NFC card is ISO14443A compatible
- Hold card closer to reader (within 3-5cm)

### Serial Port Permission (Linux/Mac)

```bash
# Add user to dialout group
sudo usermod -a -G dialout $USER
# Logout and login again
```

### Wrong Port Selected

- Disconnect other USB serial devices
- Check Device Manager (Windows) or `ls /dev/tty*` (Mac/Linux)
- Arduino usually appears as:
  - Windows: `COM3`, `COM4`, etc.
  - Mac: `/dev/tty.usbserial-*` or `/dev/tty.usbmodem-*`
  - Linux: `/dev/ttyUSB0` or `/dev/ttyACM0`

## Testing

### Test Arduino Independently

1. Open Arduino IDE
2. Open Serial Monitor (115200 baud)
3. Place NFC card near reader
4. Should see UID printed (e.g., `04A1B2C3D4E5F6`)

### Test in Desktop App

1. Run app: `npm run electron:dev`
2. Open DevTools (F12)
3. Check console for "NFC Reader connected" message
4. Scan card and watch for "NFC Card detected" log

## API Integration

The NFC UID is used to search patients via:

```typescript
const patient = await patientsApi.getPatientById(uid);
```

The backend should support searching by:
- 10-digit Patient ID
- NFC Card UID (hex string)
- Patient name
- Phone number

## Security Notes

- NFC UIDs are not encrypted
- UIDs should be stored securely in database
- Consider additional authentication for sensitive operations
- NFC is for convenience, not primary security

## Future Enhancements

- Support for NDEF data reading/writing
- Multi-reader support
- Card registration workflow
- Offline mode with local cache
