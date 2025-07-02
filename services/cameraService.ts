import { CameraView, CameraCapturedPicture } from 'expo-camera';
import * as FileSystem from 'expo-file-system';

export interface PhotoData {
  uri: string;
  base64?: string;
  width?: number;
  height?: number;
  exif?: any;
}

export async function takePhoto(cameraRef: React.RefObject<CameraView | null>): Promise<PhotoData | null> {
  try {
    if (!cameraRef.current) {
      throw new Error('Camera reference not available');
    }

    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: true,
      skipProcessing: false,
    });

    if (!photo) {
      throw new Error('Failed to capture photo');
    }

    return {
      uri: photo.uri,
      base64: photo.base64,
      width: photo.width,
      height: photo.height,
      exif: photo.exif,
    };
  } catch (error) {
    console.error('Photo capture error:', error);
    return null;
  }
}

export async function takeMultiplePhotos(
  cameraRef: React.RefObject<CameraView | null>,
  count: number = 3,
  delay: number = 1000
): Promise<PhotoData[]> {
  const photos: PhotoData[] = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const photo = await takePhoto(cameraRef);
      if (photo) {
        photos.push(photo);
      }
      
      // Wait before taking next photo
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    } catch (error) {
      console.warn(`Failed to take photo ${i + 1}:`, error);
    }
  }
  
  return photos;
}

export async function savePhotoLocally(photo: PhotoData): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `resqall_emergency_${timestamp}.jpg`;
    const directory = `${FileSystem.documentDirectory}ResQall/`;
    
    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
    
    const localUri = `${directory}${filename}`;
    
    // Copy photo to local directory
    await FileSystem.copyAsync({
      from: photo.uri,
      to: localUri,
    });
    
    return localUri;
  } catch (error) {
    console.error('Save photo error:', error);
    return null;
  }
}

export async function getPhotoInfo(uri: string): Promise<FileSystem.FileInfo | null> {
  try {
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    return info;
  } catch (error) {
    console.error('Get photo info error:', error);
    return null;
  }
}

export function formatPhotoForEmail(photo: PhotoData): string {
  const timestamp = new Date().toISOString();
  return `data:image/jpeg;base64,${photo.base64}`;
}

export async function compressPhoto(photo: PhotoData, quality: number = 0.5): Promise<PhotoData | null> {
  try {
    // This would require additional compression library like expo-image-manipulator
    // For now, return original photo
    return photo;
  } catch (error) {
    console.error('Photo compression error:', error);
    return null;
  }
}