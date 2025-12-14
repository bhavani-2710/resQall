# 🚨 ResQall – Voice-Activated Hidden SOS System

ResQall is a **voice-activated personal safety application** designed to provide a **fast, discreet, and reliable SOS mechanism** during emergency situations. The app operates silently in the background and can be triggered using a **secret voice command**, allowing users to request help even when physical interaction with the device is not possible.

---

## 📌 Features

- 🎙️ **Voice-Activated SOS Trigger**
  - Uses a secret voice command detected via OpenAI Whisper.
- 📍 **Real-Time GPS Tracking**
  - Captures and shares the user’s live location during emergencies.
- 🎧 **Ambient Audio Recording**
  - Records surrounding audio for situational awareness.
- 📸 **Camera Snapshot**
  - Automatically captures an image at SOS activation.
- 🔔 **Instant Emergency Alerts**
  - Sends alerts via SMS, push notifications, and automated emails.
- ☁️ **Secure Cloud Storage**
  - Stores SOS data securely using Firebase Firestore & Storage.
- ⚡ **Lightweight Background Service**
  - Optimized for minimal battery and resource consumption.
- 🔒 **Privacy & Security Focused**
  - End-to-end encryption and secure authentication.

---

## 🛠️ Technology Stack

### **Frontend**
- React Native
- JavaScript

### **Database & Storage**
- Firebase Firestore

### **API Integrations**
- Picovoice Porcupine – Voice recognition
- Google Maps API – Real-time GPS tracking
- SMS API (Twilio) – Emergency SMS alerts
- Zapier – Automated email notifications

### **Security**
- Firebase Authentication
- End-to-end encryption
- HTTPS communication
- Firebase Security Rules

---

## 🏗️ System Architecture

1. User registers and configures emergency contacts and secret voice command.
2. App runs silently in the background.
3. Secret voice command is detected using Picovoice Porcupine.
4. SOS is triggered automatically.
5. Location, audio, and image are captured.
6. Data is stored in Firebase Firestore & Storage.
7. Alerts are sent via SMS, push notifications, and email (Zapier).
8. Emergency contacts receive real-time SOS details.

---

## 📂 Project Structure

```plaintext
ResQall/
│
├── app/                     # App entry & navigation (Expo / RN routing)
├── assets/                  # Images, icons, fonts, static resources
├── components/              # Reusable UI components
├── config/                  # Configuration files (Firebase, API keys, constants)
├── context/                 # Global state management (Auth, User, SOS context)
├── hooks/                   # Custom React hooks (voice listener, location, permissions)
├── services/                # External services & integrations
├── utils/                   # Helper functions & utilities
│
├── .gitignore               # Git ignored files
├── app.json                 # Expo app configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## 📊 Future Enhancements
- AI-based distress detection without voice commands
- Wearable device integration
- Offline SOS fallback mechanism
- Multilingual voice command support
- Emergency service (police/ambulance) integration

## 👥 Target Users
- Women
- Children
- Elderly individuals
- Travelers
- Individuals in high-risk environments

## ✨ Acknowledgements
- Picovoice Porcupine
- Firebase
- Zapier
- Google Maps Platform
- Cloudinary
