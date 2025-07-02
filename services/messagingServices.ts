import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let recording: Audio.Recording | null = null;

export interface AudioData {
  uri: string;
  duration?: number;
  size?: number;
}

export async function startRecording(): Promise<void> {
  try {
    // Request permissions
    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Audio permission not granted');
    }

    // Simple audio mode that works across all versions
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create new recording instance
    recording = new Audio.Recording();

    // Simple recording options that work universally
    const recordingOptions = Audio.RecordingOptionsPresets.HIGH_QUALITY;

    // Prepare and start recording
    await recording.prepareToRecordAsync(recordingOptions);
    await recording.startAsync();
    
    console.log('Recording started');
  } catch (error) {
    console.error('Start recording error:', error);
    recording = null;
    throw error;
  }
}

export async function stopRecording(): Promise<AudioData | null> {
  try {
    if (!recording) {
      return null;
    }

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    
    // Reset recording instance
    recording = null;

    if (!uri) {
      return null;
    }

    // Get file info
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      return {
        uri,
        size: (fileInfo as any).size,
      };
    } catch {
      return { uri };
    }
  } catch (error) {
    console.error('Stop recording error:', error);
    recording = null;
    return null;
  }
}

export async function recordForDuration(durationMs: number): Promise<AudioData | null> {
  try {
    await startRecording();
    
    // Wait for specified duration
    await new Promise(resolve => setTimeout(resolve, durationMs));
    
    return await stopRecording();
  } catch (error) {
    console.error('Record for duration error:', error);
    return null;
  }
}

export async function saveAudioLocally(audio: AudioData): Promise<string | null> {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `resqall_audio_${timestamp}.m4a`;
    const directory = `${FileSystem.documentDirectory}ResQall/`;
    
    // Create directory if it doesn't exist
    const dirInfo = await FileSystem.getInfoAsync(directory);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(directory, { intermediates: true });
    }
    
    const localUri = `${directory}${filename}`;
    
    // Copy audio to local directory
    await FileSystem.copyAsync({
      from: audio.uri,
      to: localUri,
    });
    
    return localUri;
  } catch (error) {
    console.error('Save audio error:', error);
    return null;
  }
}

export async function getAudioDuration(uri: string): Promise<number | null> {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri });
    const status = await sound.getStatusAsync();
    
    if (status.isLoaded && status.durationMillis) {
      const duration = status.durationMillis;
      await sound.unloadAsync();
      return duration;
    }
    
    await sound.unloadAsync();
    return null;
  } catch (error) {
    console.error('Get audio duration error:', error);
    return null;
  }
}

export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export async function isRecording(): Promise<boolean> {
  try {
    if (!recording) return false;
    
    const status = await recording.getStatusAsync();
    return status.isRecording || false;
  } catch (error) {
    return false;
  }
}

export async function pauseRecording(): Promise<void> {
  try {
    if (recording) {
      const status = await recording.getStatusAsync();
      if (status.isRecording) {
        await recording.pauseAsync();
      }
    }
  } catch (error) {
    console.error('Pause recording error:', error);
  }
}

export async function resumeRecording(): Promise<void> {
  try {
    if (recording) {
      const status = await recording.getStatusAsync();
      if (!status.isRecording) {
        await recording.startAsync();
      }
    }
  } catch (error) {
    console.error('Resume recording error:', error);
  }
}

export async function getCurrentRecordingStatus(): Promise<{
  isRecording: boolean;
  durationMillis?: number;
} | null> {
  try {
    if (!recording) return null;
    
    const status = await recording.getStatusAsync();
    return {
      isRecording: status.isRecording || false,
      durationMillis: status.durationMillis,
    };
  } catch (error) {
    console.error('Get recording status error:', error);
    return null;
  }
}