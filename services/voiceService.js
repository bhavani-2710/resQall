// VoiceService.js (Converted from TS to JS)

import Voice from '@react-native-voice/voice';

class VoiceService {
  constructor(secretPhrase) {
    this.secretPhrase = secretPhrase.toLowerCase();
    this.callback = null;
    this.isListening = false;
    this.retryCount = 0;
    this.maxRetries = 3;
    this.setupVoiceHandlers();
  }

  setupVoiceHandlers() {
    Voice.onSpeechResults = this.onSpeechResults.bind(this);
    Voice.onSpeechError = this.onSpeechError.bind(this);
    Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
    Voice.onSpeechStart = this.onSpeechStart.bind(this);
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
  }

  async startListening(callback) {
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

  onSpeechStart() {
    console.log('Voice recognition started');
  }

  onSpeechPartialResults(e) {
    const partialTranscript = e.value?.join(' ').toLowerCase() || '';
    if (partialTranscript.includes(this.secretPhrase)) {
      this.callback?.(true, partialTranscript);
      this.stopListening();
    }
  }

  onSpeechResults(e) {
    const transcript = e.value?.join(' ').toLowerCase() || '';
    
    if (transcript.includes(this.secretPhrase)) {
      this.callback?.(true, transcript);
      this.stopListening();
    } else if (transcript.length > 0) {
      this.callback?.(false, transcript);
    }
  }

  onSpeechError(e) {
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

  onSpeechEnd() {
    if (this.isListening) {
      setTimeout(() => {
        if (this.isListening) {
          Voice.start('en-US').catch(console.warn);
        }
      }, 500);
    }
  }

  updateSecretPhrase(newPhrase) {
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
