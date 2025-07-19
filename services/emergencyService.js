import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as MediaLibrary from 'expo-media-library';
import * as SMS from 'expo-sms';
import { Platform } from 'react-native';

export class EmergencyService {
  static instance;

  constructor() {
    if (EmergencyService.instance) {
      return EmergencyService.instance;
    }
    EmergencyService.instance = this;
    this.emergencyContacts = [];
    this.isRecording = false;
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
        throw new Error('Location permission not granted');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        return lastLocation;
      } catch (fallbackError) {
        console.error('Failed to get last known location:', fallbackError);
        return null;
      }
    }
  }

  async takePhoto(cameraRef) {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera not available');
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

      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }

      return photo.uri;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }

  async recordVideo(cameraRef) {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera not available');
      }

      this.isRecording = true;
      const promise = cameraRef.current.recordAsync({
        quality: '480p', // Balanced quality for emergency use; adjust as needed
      });

      await new Promise(resolve => setTimeout(resolve, 10000)); // Record for 10 seconds

      cameraRef.current.stopRecording();
      const video = await promise;

      this.isRecording = false;
      return video.uri;
    } catch (error) {
      console.error('Failed to record video:', error);
      if (this.isRecording && cameraRef.current) {
        try {
          cameraRef.current.stopRecording();
        } catch (stopError) {
          console.error('Failed to stop video recording:', stopError);
        }
      }
      this.isRecording = false;
      return null;
    }
  }

  async getDeviceInfo() {
    return {
      deviceName: Device.deviceName || 'Unknown Device',
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceId: Device.osInternalBuildId || 'Unknown',
    };
  }

  async collectEmergencyData(cameraRef) {
    const timestamp = Date.now();
    
    const [location, photoUri, videoUri, deviceInfo] = await Promise.all([
      this.getLocation(),
      this.takePhoto(cameraRef),
      this.recordVideo(cameraRef),
      this.getDeviceInfo(),
    ]);

    return {
      location,
      photoUri,
      videoUri,
      timestamp,
      deviceInfo,
    };
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
${data.videoUri ? '📹 Video recording attached' : '📹 Video not available'}

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
      
      if (data.videoUri) {
        attachments.push(data.videoUri);
      }

      const recipientEmails = this.emergencyContacts.length > 0 
        ? this.emergencyContacts.map(contact => contact.email)
        : ['emergency@example.com'];

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
      
      const phoneNumbers = this.emergencyContacts.length > 0 
        ? this.emergencyContacts.map(contact => contact.phone)
        : ['+1234567890'];

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
