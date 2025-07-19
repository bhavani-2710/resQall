import * as Location from 'expo-location';
import { Alert } from 'react-native';

export async function getLocation() {
  let { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Location permission is required.');
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
      throw new Error('Could not fetch location.');
  }
}
