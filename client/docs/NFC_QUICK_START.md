# NFC Quick Start Guide

## 5-Minute Setup

### Step 1: Hardware Setup (2 minutes)

1. Connect PN532 to Arduino:
   ```
   PN532 VCC → Arduino 5V
   PN532 GND → Arduino GND
   PN532 SDA → Arduino A4
   PN532 SCL → Arduino A5
   ```

2. Connect Arduino to computer via USB

### Step 2: Arduino Setup (2 minutes)

1. Open Arduino IDE
2. Install library: `Adafruit PN532`
   - Tools → Manage Libraries → Search "Adafruit PN532" → Install
3. Open `client/docs/arduino_nfc_reader.ino`
4. Select your board: Tools → Board → Arduino Uno (or your model)
5. Select port: Tools → Port → COM3 (or your port)
6. Click Upload button

### Step 3: Test Arduino (1 minute)

1. Open Serial Monitor (Ctrl+Shift+M)
2. Set baud rate to 115200
3. Place NFC card near reader
4. Should see: `04A1B2C3D4E5F6` (your card's UID)

### Step 4: Run Desktop App

```bash
cd client
npm run electron:dev
```

### Step 5: Test NFC Scanning

1. Login as Receptionist
2. Click "Existing Patient"
3. Click "Scan NFC Card" button
4. If port selection appears:
   - Select your Arduino port (e.g., COM3)
   - Click "Connect & Scan"
5. Place NFC card near reader
6. Patient should be auto-searched!

## Troubleshooting

### "No ports found"
- Check USB cable
- Verify Arduino appears in Device Manager (Windows)
- Try different USB port

### "PN532 not found" in Serial Monitor
- Check wiring (especially SDA/SCL)
- Verify PN532 is in I2C mode (check jumpers)
- Try different PN532 module

### Card not detected
- Hold card closer (within 3-5cm)
- Try different NFC card
- Check Serial Monitor shows UIDs

### Port permission denied (Linux/Mac)
```bash
sudo usermod -a -G dialout $USER
# Logout and login
```

## Common Arduino Ports

- Windows: `COM3`, `COM4`, `COM5`, etc.
- Mac: `/dev/tty.usbserial-*` or `/dev/tty.usbmodem-*`
- Linux: `/dev/ttyUSB0` or `/dev/ttyACM0`

## Next Steps

- Read full setup guide: `NFC_SETUP.md`
- View flow diagrams: `NFC_FLOW_DIAGRAM.md`
- Check integration summary: `../NFC_INTEGRATION_SUMMARY.md`

## Support

If you encounter issues:
1. Check Arduino Serial Monitor (115200 baud)
2. Check Electron DevTools console (F12)
3. Verify wiring matches diagram
4. Try different USB port/cable
