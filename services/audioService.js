import { Audio } from 'expo-audio';
import { Alert } from 'react-native';

export async function recordAudio(duration) {
  const { status } = await Audio.requestPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Permission Denied', 'Microphone permission is required.');
    return null;
  }

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();

    // Wait for the specified duration
    await new Promise(resolve => setTimeout(resolve, duration));

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    return uri;
  } catch (error) {
    console.error('Failed to record audio:', error);
    throw new Error('Could not record audio.');
  }
}
