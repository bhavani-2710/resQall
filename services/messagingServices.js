import * as SMS from 'expo-sms';
import { Alert } from 'react-native';

export async function sendEmergencySMS(phoneNumber, location, photoUris, audioUri) {
  const isAvailable = await SMS.isAvailableAsync();
  if (isAvailable) {
    const message = `EMERGENCY! I need help.
My location is: http://maps.google.com/maps?q=${location.latitude},${location.longitude}
This is critical. Please contact authorities.
Evidence has been recorded.`;
    
    // Note: expo-sms does not support attachments.
    // This is a key limitation. A backend service is needed to send MMS or links to cloud-stored files.
    
    await SMS.sendSMSAsync(phoneNumber, message);
  } else {
    Alert.alert("SMS Not Available", "Your device does not support sending SMS through this app.");
  }
}
