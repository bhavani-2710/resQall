import { AudioModule, RecordingPresets, setAudioModeAsync, useAudioRecorder } from "expo-audio";
import { uploadAudioToCloudinary } from "@/utils/cloudinary";
import { Alert } from "react-native";

export async function recordAudio(recorder, duration = 10000) {
  try {
    // 1️⃣ Request microphone permission
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission to access microphone was denied");
      return null;
    }

    // 2️⃣ Configure audio mode
    await setAudioModeAsync({
      playsInSilentMode: true,
      allowsRecording: true,
    });

    await recorder.prepareToRecordAsync();

    // 4️⃣ Start recording
    recorder.record();

    // 5️⃣ Stop after specified duration
    await new Promise((resolve) => setTimeout(resolve, duration));

    await recorder.stop();
    const uri = recorder.uri;

    // 6️⃣ Upload to Cloudinary
    const audioUrl = await uploadAudioToCloudinary(uri);

    return audioUrl;
  } catch (error) {
    console.error("Failed to record audio:", error);
    Alert.alert("Audio recording failed", error.message);
    return null;
  }
}
