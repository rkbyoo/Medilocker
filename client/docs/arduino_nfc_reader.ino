/*
 * NFC Reader for Hospital Management System
 * 
 * Hardware: Arduino + PN532 NFC Module (I2C)
 * 
 * Wiring:
 * PN532 VCC -> Arduino 5V
 * PN532 GND -> Arduino GND
 * PN532 SDA -> Arduino A4 (Uno/Nano) or SDA pin
 * PN532 SCL -> Arduino A5 (Uno/Nano) or SCL pin
 * 
 * Required Libraries:
 * - Adafruit PN532 (Install via Arduino Library Manager)
 */

#include <Arduino.h>
#include <Wire.h>
#include <PN532_I2C.h>
#include <PN532.h>

PN532_I2C pn532_i2c(Wire);
PN532 nfc(pn532_i2c);

String lastUID = "";
uint8_t uid[7];
uint8_t uidLength;

void setup() {
  Serial.begin(115200);
  
  nfc.begin();
  
  uint32_t versiondata = nfc.getFirmwareVersion();
  if (!versiondata) {
    Serial.println("ERROR: PN532 not found");
    while (1); // halt
  }
  
  // Configure board to read RFID tags
  nfc.SAMConfig();
  
  Serial.println("READY");
}

void loop() {
  // Read only the UID, no NDEF checking
  if (nfc.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength)) {
    // Convert UID to hex string
    String currentUID = "";
    for (uint8_t i = 0; i < uidLength; i++) {
      if (uid[i] < 0x10) currentUID += "0";
      currentUID += String(uid[i], HEX);
    }
    currentUID.toUpperCase();
    
    // Prevent duplicate reads while card is still present
    if (currentUID != lastUID) {
      Serial.println(currentUID);
      lastUID = currentUID;
    }
    
    delay(500);
  } else {
    // Reset when card removed
    lastUID = "";
  }
}
