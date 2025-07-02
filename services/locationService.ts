import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number | null;
  altitude?: number | null;
  speed?: number | null;
  timestamp: number;
  address?: string;
}

export async function getCurrentLocation(): Promise<LocationData> {
  try {
    // Request permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission not granted');
    }

    // Get current position with compatible options
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
      maximumAge: 30000,
    } as any);

    const locationData: LocationData = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      altitude: location.coords.altitude,
      speed: location.coords.speed,
      timestamp: location.timestamp,
    };

    // Try to get address
    try {
      const addresses = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (addresses.length > 0) {
        const address = addresses[0];
        locationData.address = [
          address.streetNumber,
          address.street,
          address.district,
          address.city,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ');
      }
    } catch (error) {
      console.warn('Failed to get address:', error);
    }

    return locationData;
  } catch (error) {
    console.error('Location error:', error);
    throw new Error(`Failed to get location: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getCurrentLocationWithTimeout(timeoutMs: number = 10000): Promise<LocationData> {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Location request timed out'));
    }, timeoutMs);

    try {
      const location = await getCurrentLocation();
      clearTimeout(timeoutId);
      resolve(location);
    } catch (error) {
      clearTimeout(timeoutId);
      reject(error);
    }
  });
}

export function formatLocationForMessage(location: LocationData): string {
  const { latitude, longitude, address } = location;
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  
  let message = `📍 Emergency Location:\n`;
  message += `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
  if (address) {
    message += `Address: ${address}\n`;
  }
  message += `Google Maps: ${googleMapsUrl}\n`;
  message += `Timestamp: ${new Date(location.timestamp).toLocaleString()}`;
  
  if (location.accuracy) {
    message += `\nAccuracy: ±${location.accuracy.toFixed(0)}m`;
  }
  
  return message;
}

export async function watchLocation(callback: (location: LocationData | null) => void) {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      callback(null);
      return null;
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      },
      (location) => {
        const locationData: LocationData = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
          timestamp: location.timestamp,
        };
        callback(locationData);
      }
    );

    return subscription;
  } catch (error) {
    console.error('Watch location error:', error);
    callback(null);
    return null;
  }
}

export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in kilometers
}

export function isLocationValid(location: LocationData): boolean {
  return (
    location.latitude >= -90 && location.latitude <= 90 &&
    location.longitude >= -180 && location.longitude <= 180 &&
    !isNaN(location.latitude) && 
    !isNaN(location.longitude)
  );
}