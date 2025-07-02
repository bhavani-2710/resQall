// services/emergencyService.ts (Fixed TypeScript Issues)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { CameraView } from 'expo-camera';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as MailComposer from 'expo-mail-composer';
import * as MediaLibrary from 'expo-media-library';
import * as SMS from 'expo-sms';
import { Platform } from 'react-native';

export interface EmergencyContact {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  priority: 'high' | 'medium' | 'low';
}

export interface EmergencyData {
  location: Location.LocationObject | null;
  photoUri: string | null;
  audioUri: string | null;
  timestamp: number;
  deviceInfo: {
    deviceName: string;
    platform: string;
    osVersion: string;
    deviceId: string;
  };
  batteryLevel?: number;
  networkInfo?: {
    isConnected: boolean;
    type: string;
  };
}

export class EmergencyService {
  private static instance: EmergencyService;
  private emergencyContacts: EmergencyContact[] = [];
  private isRecording = false;
  private recording: Audio.Recording | null = null;

  private constructor() {
    this.loadEmergencyContacts();
  }

  public static getInstance(): EmergencyService {
    if (!EmergencyService.instance) {
      EmergencyService.instance = new EmergencyService();
    }
    return EmergencyService.instance;
  }

  private async loadEmergencyContacts() {
    try {
      const contactsJson = await AsyncStorage.getItem('emergency_contacts');
      if (contactsJson) {
        this.emergencyContacts = JSON.parse(contactsJson);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  }

  async getLocation(): Promise<Location.LocationObject | null> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      });

      return location;
    } catch (error) {
      console.error('Failed to get location:', error);
      
      // Try to get last known location as fallback
      try {
        const lastLocation = await Location.getLastKnownPositionAsync();
        return lastLocation;
      } catch (fallbackError) {
        console.error('Failed to get last known location:', fallbackError);
        return null;
      }
    }
  }

  async takePhoto(cameraRef: React.RefObject<CameraView>): Promise<string | null> {
    try {
      if (!cameraRef.current) {
        throw new Error('Camera not available');
      }

      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Media library permission not granted');
      }

      // Take photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: false,
        skipProcessing: false,
      });

      // Save to device storage
      if (status === 'granted') {
        await MediaLibrary.saveToLibraryAsync(photo.uri);
      }

      return photo.uri;
    } catch (error) {
      console.error('Failed to take photo:', error);
      return null;
    }
  }

  async recordAudio(): Promise<string | null> {
    try {
      // Request audio permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      this.recording = recording;
      this.isRecording = true;

      // Record for 10 seconds
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Stop recording
      await recording.stopAndUnloadAsync();
      this.isRecording = false;

      const uri = recording.getURI();
      return uri;
    } catch (error) {
      console.error('Failed to record audio:', error);
      if (this.recording) {
        try {
          await this.recording.stopAndUnloadAsync();
        } catch (stopError) {
          console.error('Failed to stop recording:', stopError);
        }
      }
      this.isRecording = false;
      return null;
    }
  }

  private async getDeviceInfo() {
    return {
      deviceName: Device.deviceName || 'Unknown Device',
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
      deviceId: Device.osInternalBuildId || 'Unknown',
    };
  }

  async collectEmergencyData(cameraRef: React.RefObject<CameraView>): Promise<EmergencyData> {
    const timestamp = Date.now();
    
    // Collect all data in parallel for faster processing
    const [location, photoUri, audioUri, deviceInfo] = await Promise.all([
      this.getLocation(),
      this.takePhoto(cameraRef),
      this.recordAudio(),
      this.getDeviceInfo(),
    ]);

    return {
      location,
      photoUri,
      audioUri,
      timestamp,
      deviceInfo,
    };
  }

  private formatEmergencyMessage(data: EmergencyData): string {
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
${data.audioUri ? '🎤 Audio recording attached' : '🎤 Audio not available'}

If this is a real emergency, please call local emergency services immediately.

Google Maps Link: ${data.location ? `https://maps.google.com/?q=${data.location.coords.latitude},${data.location.coords.longitude}` : 'Not available'}`;
  }

  async sendEmailAlert(data: EmergencyData): Promise<boolean> {
    try {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Email is not available on this device');
      }

      const message = this.formatEmergencyMessage(data);
      const attachments: string[] = [];
      
      // Add photo attachment if available
      if (data.photoUri) {
        attachments.push(data.photoUri);
      }
      
      // Add audio attachment if available
      if (data.audioUri) {
        attachments.push(data.audioUri);
      }

      // Get emergency contacts (for now, using a default email)
      const recipientEmails = this.emergencyContacts.length > 0 
        ? this.emergencyContacts.map(contact => contact.email)
        : ['emergency@example.com']; // Default fallback

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

  async sendSMSAlert(data: EmergencyData): Promise<boolean> {
    try {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('SMS is not available on this device');
      }

      const message = this.formatEmergencyMessage(data);
      
      // Get emergency contacts (for now, using a default number)
      const phoneNumbers = this.emergencyContacts.length > 0 
        ? this.emergencyContacts.map(contact => contact.phone)
        : ['+1234567890']; // Default fallback

      await SMS.sendSMSAsync(phoneNumbers, message);
      return true;
    } catch (error) {
      console.error('Failed to send SMS alert:', error);
      return false;
    }
  }

  async sendSMSAlertWithRetry(data: EmergencyData, maxRetries: number = 3): Promise<boolean> {
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
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }
    
    return false;
  }

  // Method to add emergency contacts
  async addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): Promise<void> {
    const newContact: EmergencyContact = {
      ...contact,
      id: Date.now().toString(),
    };
    
    this.emergencyContacts.push(newContact);
    await this.saveEmergencyContacts();
  }

  // Method to save contacts to storage
  private async saveEmergencyContacts(): Promise<void> {
    try {
      await AsyncStorage.setItem('emergency_contacts', JSON.stringify(this.emergencyContacts));
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
    }
  }

  // Method to get all contacts
  getEmergencyContacts(): EmergencyContact[] {
    return this.emergencyContacts;
  }

  // Method to remove a contact
  async removeEmergencyContact(contactId: string): Promise<void> {
    this.emergencyContacts = this.emergencyContacts.filter(contact => contact.id !== contactId);
    await this.saveEmergencyContacts();
  }

  // Add this method
  async testEmergencySystem(): Promise<boolean> {
    // Implement your test logic here (e.g., send a test SMS/email)
    // For now, just simulate success
    return true;
  }
}