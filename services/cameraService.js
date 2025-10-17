import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";

export async function takePhoto(cameraRef) {
  try {
    if (!cameraRef?.current) return null;

    const { status } = await Camera.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Camera permission denied");
      return null;
    }

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    const mediaStatus = await MediaLibrary.requestPermissionsAsync();

    if (mediaStatus.granted && photo.uri) {
      await MediaLibrary.saveToLibraryAsync(photo.uri);
    }

    return photo.uri;
  } catch (error) {
    console.error("Failed to take photo:", error);
    return null;
  }
}
