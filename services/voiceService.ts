import Voice, { SpeechResultsEvent, SpeechErrorEvent } from '@react-native-voice/voice';

type VoiceCallback = (detected: boolean, transcript?: string, error?: string) => void;

class VoiceService {
  private secretPhrase: string;
  private callback: VoiceCallback | null = null;
  private isListening: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(secretPhrase: string) {
    this.secretPhrase = secretPhrase.toLowerCase();
    this.setupVoiceHandlers();
  }

  private setupVoiceHandlers() {
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
  }

  async startListening(callback: VoiceCallback) {
    try {
      this.callback = callback;
      this.isListening = true;
      this.retryCount = 0;
      await Voice.start('en-US');
    } catch (error) {
      this.callback?.(false, undefined, `Failed to start listening: ${error}`);
    }
  }

  async stopListening() {
    try {
      this.isListening = false;
      await Voice.stop();
      this.callback = null;
    } catch (error) {
      console.warn('Error stopping voice recognition:', error);
    }
  }

  private onSpeechStart() {
    console.log('Voice recognition started');
  }

  private onSpeechPartialResults(e: SpeechResultsEvent) {
    const partialTranscript = e.value?.join(' ').toLowerCase() || '';
    if (partialTranscript.includes(this.secretPhrase)) {
      this.callback?.(true, partialTranscript);
      this.stopListening();
    }
  }

  private onSpeechResults(e: SpeechResultsEvent) {
    const transcript = e.value?.join(' ').toLowerCase() || '';
    
    if (transcript.includes(this.secretPhrase)) {
      this.callback?.(true, transcript);
      this.stopListening();
    } else if (transcript.length > 0) {
      this.callback?.(false, transcript);
    }
  }

  private onSpeechError(e: SpeechErrorEvent) {
    console.log('Voice error:', e.error);
    
    if (this.isListening && this.retryCount < this.maxRetries) {
      this.retryCount++;
      setTimeout(() => {
        if (this.isListening) {
          Voice.start('en-US').catch(console.warn);
        }
      }, 1000);
    } else {
      this.callback?.(false, undefined, `Voice recognition error: ${e.error?.message || 'Unknown error'}`);
    }
  }

  private onSpeechEnd() {
    if (this.isListening) {
      // Restart listening automatically with a small delay
      setTimeout(() => {
        if (this.isListening) {
          Voice.start('en-US').catch(console.warn);
        }
      }, 500);
    }
  }

  updateSecretPhrase(newPhrase: string) {
    this.secretPhrase = newPhrase.toLowerCase();
  }

  async destroy() {
    this.isListening = false;
    try {
      await Voice.destroy();
      Voice.removeAllListeners();
    } catch (error) {
      console.warn('Error destroying voice service:', error);
    }
  }
}

export default VoiceService;