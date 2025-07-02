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

    // Set audio mode
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
      // Removed interruptionModeIOS and interruptionModeAndroid as they are deprecated or not present in latest expo-av types
    });

    // Create new recording instance
    recording = new Audio.Recording();

    // Define recording options
    const recordingOptions = {
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
      },
    };

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
    
    // If no URI, return null
    if (!uri) {
      recording = null;
      return null;
    }

    let size = 0;
    const fileInfo = await FileSystem.getInfoAsync(uri);
    size = (fileInfo as any).size ?? 0; // TypeScript may not recognize 'size', so use 'as any'
    
    // Reset recording instance
    recording = null;

    return {
      uri, // Now guaranteed to be string, not string | null
      size,
    };
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
    
    if (status.isLoaded) {
      const duration = status.durationMillis ?? null;
      await sound.unloadAsync();
      return duration;
    }
    
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
    return status.isRecording;
  } catch (error) {
    return false;
  }
}

export async function pauseRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.pauseAsync();
    }
  } catch (error) {
    console.error('Pause recording error:', error);
  }
}

export async function resumeRecording(): Promise<void> {
  try {
    if (recording) {
      await recording.startAsync();
    }
  } catch (error) {
    console.error('Resume recording error:', error);
  }
}