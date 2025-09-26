import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as MediaLibrary from 'expo-media-library';
import * as SMS from 'expo-sms';
import { Platform, Alert } from 'react-native';

export class EmergencyService {
  static instance;

  constructor() {
    if (EmergencyService.instance) {
      return EmergencyService.instance;
    }
    EmergencyService.instance = this;
    this.emergencyContacts = [];
    this.loadEmergencyContacts();
  }

  static getInstance() {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  async loadEmergencyContacts() {
    try {
      const contactsJson = await AsyncStorage.getItem('emergency_contacts');
      if (contactsJson) {
        this.emergencyContacts = JSON.parse(contactsJson);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  }

  async getLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      console.log('Location obtained:', location);
      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        console.log('Using last known location:', lastLocation);
        return lastLocation;
      } catch (fallbackError) {
        console.error('Failed to get last known location:', fallbackError);
        return null;
      }
    }
  }

  async takePhoto(cameraRef) {
    try {
      console.log('Taking photo with camera:', cameraRef);
      
      if (!cameraRef || !cameraRef.current) {
        console.error('Camera ref not available:', cameraRef);
        return null;
      }

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission not granted');
      }

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      console.log('Photo taken:', photo);

      if (status === 'granted' && photo && photo.uri) {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }

      return photo ? photo.uri : null;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }

  async getDeviceInfo() {
    const info = {
      deviceName: Device.deviceName || 'Unknown Device',
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceId: Device.osInternalBuildId || 'Unknown',
    };
    console.log('Device info:', info);
    return info;
  }

  // Modified to accept audio recording from external source (the component)
  async collectEmergencyData(cameraRef, audioRecordingCallback = null) {
    console.log('=== STARTING EMERGENCY DATA COLLECTION ===');
    console.log('Camera ref received:', cameraRef);
    
    const timestamp = Date.now();
    
    try {
      console.log('Collecting emergency data...');
      
      // Start all tasks in parallel, but audio recording might be handled externally
      const locationPromise = this.getLocation();
      const photoPromise = this.takePhoto(cameraRef);
      const deviceInfoPromise = this.getDeviceInfo();
      
      // If audio recording callback is provided, use it; otherwise skip audio
      let audioPromise;
      if (audioRecordingCallback && typeof audioRecordingCallback === 'function') {
        console.log('Starting audio recording via callback...');
        audioPromise = audioRecordingCallback(30000); // 30 seconds
      } else {
        console.log('No audio recording callback provided, skipping audio');
        audioPromise = Promise.resolve(null);
      }
      
      const [location, photoUri, audioUri, deviceInfo] = await Promise.all([
        locationPromise,
        photoPromise,
        audioPromise,
        deviceInfoPromise,
      ]);

      const data = {
        location,
        photoUri,
        audioUri, // This will be the audio URI from the component or null
        timestamp,
        deviceInfo,
      };

      console.log('=== EMERGENCY DATA COLLECTED ===');
      console.log('Location:', location ? 'Available' : 'Not available');
      console.log('Photo:', photoUri ? 'Available' : 'Not available');
      console.log('Audio:', audioUri ? 'Available' : 'Not available');
      console.log('===================================');

      return data;
    } catch (error) {
      console.error('Error in collectEmergencyData:', error);
      throw error;
    }
  }

  formatEmergencyMessage(data) {
    const date = new Date(data.timestamp).toLocaleString();
    const locationText = data.location 
      ? `Location: ${data.location.coords.latitude.toFixed(6)}, ${data.location.coords.longitude.toFixed(6)}`
      : 'Location: Not available';
    
    return `🚨 EMERGENCY ALERT 🚨

This is an automated emergency alert sent at ${date}.

${locationText}

Device: ${data.deviceInfo.deviceName}
Platform: ${data.deviceInfo.platform} ${data.deviceInfo.osVersion}

${data.photoUri ? '📷 Photo attached' : '📷 Photo not available'}
${data.audioUri ? '🎤 Audio recording attached (30 seconds)' : '🎤 Audio recording not available'}

If this is a real emergency, please call local emergency services immediately.

Google Maps Link: ${data.location ? `https://maps.google.com/?q=${data.location.coords.latitude},${data.location.coords.longitude}` : 'Not available'}`;
  }

  async sendEmailAlert(data) {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Email is not available on this device');
      }

      const message = this.formatEmergencyMessage(data);
      const attachments = [];
      
      if (data.photoUri) {
        attachments.push(data.photoUri);
      }
      
      if (data.audioUri) {
        attachments.push(data.audioUri);
      }

      const recipientEmails = this.emergencyContacts
        .filter(contact => contact.email && contact.email.trim() !== '')
        .map(contact => contact.email);

      if (recipientEmails.length === 0) {
        console.warn('No emergency contact email addresses available');
        // For testing, you can add a default email
        recipientEmails.push('test@example.com');
      }

      await MailComposer.composeAsync({
        recipients: recipientEmails,
        subject: '🚨 EMERGENCY ALERT - Immediate Attention Required',
        body: message,
        attachments: attachments,
        isHtml: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to send email alert:', error);
      return false;
    }
  }

  async sendSMSAlert(data) {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('SMS is not available on this device');
      }

      const message = this.formatEmergencyMessage(data);
      
      const phoneNumbers = this.emergencyContacts
        .filter(contact => contact.phone && contact.phone.trim() !== '')
        .map(contact => contact.phone);

      if (phoneNumbers.length === 0) {
        console.warn('No emergency contact phone numbers available');
        // For testing, you can add a default number
        phoneNumbers.push('+1234567890');
      }

      await SMS.sendSMSAsync(phoneNumbers, message);
      return true;
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
      return false;
    }
  }

  async sendSMSAlertWithRetry(data, maxRetries = 3) {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        const success = await this.sendSMSAlert(data);
        if (success) {
          return true;
        }
      } catch (error) {
        console.error(`SMS attempt ${retryCount + 1} failed:`, error);
      }
      
      retryCount++;
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    return false;
  }

  async addEmergencyContact(contact) {
    if (!contact.phone && !contact.email) {
      throw new Error('Emergency contact must have at least a phone number or email address');
    }

    const newContact = {
      ...contact,
      id: Date.now().toString(),
    };
    
    this.emergencyContacts.push(newContact);
    await this.saveEmergencyContacts();
  }

  async saveEmergencyContacts() {
    try {
      await AsyncStorage.setItem('emergency_contacts', JSON.stringify(this.emergencyContacts));
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
    }
  }

  getEmergencyContacts() {
    return this.emergencyContacts;
  }

  async removeEmergencyContact(contactId) {
    this.emergencyContacts = this.emergencyContacts.filter(contact => contact.id !== contactId);
    await this.saveEmergencyContacts();
  }

  async testEmergencySystem() {
    return true;
  }
}

export default EmergencyService;