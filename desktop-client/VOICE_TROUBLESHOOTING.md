# Voice Input Troubleshooting Guide

## Current Status: Electron Limitation Identified

### Issue Summary
The desktop (Electron) version has a **fundamental limitation** with the Web Speech API. While microphone permissions are granted correctly, the Speech Recognition API starts and immediately stops, making voice input unreliable.

### Web Version ✅
The web version works correctly with proper microphone permissions:
1. Browser asks for microphone permission on first use
2. Voice input works consistently
3. Auto-restart functionality works for continuous recording

### Desktop (Electron) Version ⚠️
**Known Limitation**: Electron's implementation of the Web Speech API is incomplete and unreliable.

#### Root Cause:
- **Microphone Access**: ✅ Working (permissions granted correctly)
- **Speech Recognition API**: ❌ Starts but immediately ends
- **Electron Web API Support**: ⚠️ Incomplete implementation

#### What We've Implemented:

1. **Permission Handlers**: ✅ Microphone permissions work correctly
   ```javascript
   // Automatically grant microphone permissions
   mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
     if (permission === 'microphone' || permission === 'media') {
       callback(true);
     } else {
       callback(false);
     }
   });
   ```

2. **Enhanced Error Handling**: ✅ Better detection of Electron limitations

3. **User Warnings**: ✅ Clear messaging about desktop app limitations

4. **Fallback Guidance**: ✅ Directs users to web version for voice input

#### Testing:

1. **Development Mode**: Debug panel shows environment info and microphone test button
2. **Console Logging**: Check browser/Electron console for detailed error messages
3. **Manual Testing**: Use the "Test Microphone" button to verify permissions

## Recommended Solutions:

### For Voice Input (Recommended):
1. **Use Web Version**: Open `http://localhost:5173` in Chrome or Edge
   - Full Web Speech API support
   - Reliable voice recognition
   - Better user experience

### For Desktop App Users:
1. **Manual Text Input**: Type diagnosis and notes manually
2. **Copy from Web Version**: Use voice input in web version, then copy to desktop
3. **External Voice Tools**: Use system voice-to-text tools and paste results

### Alternative Approaches:
1. **Hybrid Workflow**: Use web version for voice input, desktop for other features
2. **External Speech Recognition**: Integrate with dedicated speech recognition services
3. **Future Enhancement**: Consider implementing native speech recognition for Electron

## Development Testing

Run in development mode to see debug information:
```bash
npm run dev
```

The consultation page will show debug info including:
- Speech API support status
- Current listening state
- Environment detection (Browser vs Electron)
- Microphone test button

## Production Testing

For the Electron app:
```bash
npm run electron:build
npm run electron:start
```

## Browser Compatibility

- **Chrome/Chromium**: Full support (recommended)
- **Edge**: Full support
- **Safari**: Limited support
- **Firefox**: No support for Web Speech API

## Electron Version Notes

- Minimum Electron version: 13+ (for better Web API support)
- Current implementation tested with Electron 20+
- Some older versions may have Web Speech API limitations