import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View
} from 'react-native';
import { 
  useAudioRecorder, 
  AudioModule, 
  RecordingPresets, 
  setAudioModeAsync,
  useAudioRecorderState 
} from 'expo-audio';
import EmergencyService from '../../services/emergencyService.js';

const { width, height } = Dimensions.get('window');

export default function Emergency() {
  const router = useRouter();
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  // Audio recording setup with hooks
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  const [steps, setSteps] = useState([
    { id: 'location', label: 'Getting Location', description: 'Acquiring GPS coordinates...', status: 'pending', progress: 0 },
    { id: 'photo', label: 'Taking Photo', description: 'Capturing environment photo...', status: 'pending', progress: 0 },
    { id: 'audio', label: 'Recording Audio', description: 'Recording 30 seconds of audio...', status: 'pending', progress: 0 },
    { id: 'email', label: 'Sending Email Alert', description: 'Notifying emergency contacts via email...', status: 'pending', progress: 0 },
    { id: 'sms', label: 'Sending SMS Alert', description: 'Sending SMS to emergency contacts...', status: 'pending', progress: 0 },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [emergencyData, setEmergencyData] = useState(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Initialize audio permissions
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          console.warn('Audio recording permission not granted');
        }
        
        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (error) {
        console.error('Failed to initialize audio:', error);
      }
    };

    initializeAudio();
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnimation, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const updateStepStatus = (stepId, status, progress = 0) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status, progress } : step)));
    const completedSteps = steps.filter((s) => s.status === 'completed').length;
    const newProgress = (completedSteps / steps.length) * 100;
    setOverallProgress(newProgress);
    Animated.timing(progressAnimation, { toValue: newProgress, duration: 500, useNativeDriver: false }).start();
  };

  const simulateProgress = (stepId, duration = 3000) => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        updateStepStatus(stepId, 'processing', progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, duration / 10);
    });
  };

  // Audio recording function that works with the new expo-audio API
  const recordEmergencyAudio = async (duration = 30000) => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      await new Promise(resolve => setTimeout(resolve, duration));
      await audioRecorder.stop();
      return audioRecorder.uri;
    } catch (error) {
      console.error('Failed to record audio:', error);
      return null;
    }
  };

  const processEmergency = async () => {
    try {
      const emergencyService = EmergencyService.getInstance();
      Vibration.vibrate([100, 50, 100]);

      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) throw new Error('Camera permission required');
      }

      setCurrentStep(0);
      updateStepStatus('location', 'processing');
      await simulateProgress('location', 2000);
      updateStepStatus('location', 'completed', 100);

      setCurrentStep(1);
      updateStepStatus('photo', 'processing');
      await simulateProgress('photo', 2500);
      updateStepStatus('photo', 'completed', 100);

      setCurrentStep(2);
      updateStepStatus('audio', 'processing');
      
      if (!cameraRef.current) throw new Error('Camera not available');
      
      const data = await emergencyService.collectEmergencyData(cameraRef, recordEmergencyAudio);
      setEmergencyData(data);
      updateStepStatus('audio', 'completed', 100);

      setCurrentStep(3);
      updateStepStatus('email', 'processing');
      await simulateProgress('email', 2000);
      const emailSuccess = await emergencyService.sendEmailAlert(data);
      updateStepStatus('email', emailSuccess ? 'completed' : 'failed', 100);

      setCurrentStep(4);
      updateStepStatus('sms', 'processing');
      await simulateProgress('sms', 2500);
      const smsSuccess = await emergencyService.sendSMSAlertWithRetry(data);
      updateStepStatus('sms', smsSuccess ? 'completed' : 'failed', 100);
      if (!smsSuccess) setErrorMessage('SMS failed, but email sent.');

      setIsCompleted(true);
      setOverallProgress(100);
      Vibration.vibrate([200, 100, 200]);

      setTimeout(() => {
        const message = errorMessage || 'Emergency alert sent successfully!';
        Alert.alert('Emergency Alert Sent', message, [{ text: 'OK', onPress: () => router.back() }]);
      }, 1500);
    } catch (error) {
      console.error('Emergency processing failed:', error);
      setHasError(true);
      setErrorMessage(error.message || 'An error occurred');
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) updateStepStatus(currentStepId, 'failed', 0);
      Vibration.vibrate([500, 200, 500]);
      Alert.alert('Emergency Error', error.message || 'An error occurred', [
        { text: 'Retry', onPress: processEmergency },
        { text: 'Cancel', onPress: () => router.back() },
      ]);
    }
  };

  useEffect(() => {
    processEmergency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStepIcon = (step) => {
    switch (step.status) {
      case 'completed': return <Ionicons name="checkmark-circle" size={28} color="#22c55e" />;
      case 'failed': return <Ionicons name="close-circle" size={28} color="#ef4444" />;
      case 'processing': return <ActivityIndicator size="small" color="#eab308" />;
      default: return <Ionicons name="ellipse-outline" size={28} color="#6b7280" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={{ alignItems: 'center', marginBottom: 18 }}>
            <Ionicons name="warning" size={48} color="#FF6347" />
            <Text style={styles.header}>Emergency Mode</Text>
            <Text style={styles.subheader}>Processing your emergency alert...</Text>
          </View>
          
          <View style={styles.progressBarBg}>
            <Animated.View style={[styles.progressBar, { width: progressAnimation.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }) }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(overallProgress)}%</Text>
          <View style={{ marginTop: 24 }}>
            {steps.map((step, idx) => (
              <View key={step.id} style={[styles.stepRow, currentStep === idx && styles.activeStep]}> 
                {getStepIcon(step)}
                <Text style={[styles.stepLabel, currentStep === idx && styles.activeStepLabel]}>{step.label}</Text>
                <Text style={styles.stepStatus}>{step.status.charAt(0).toUpperCase() + step.status.slice(1)}</Text>
              </View>
            ))}
          </View>
          {isCompleted && (
            <View style={styles.successBox}>
              <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
              <Text style={styles.successText}>Alert Sent Successfully!</Text>
            </View>
          )}
          {hasError && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}
        </View>
      </ScrollView>
      {/* Hidden CameraView for photo capture */}
      {permission?.granted && (
        <CameraView ref={cameraRef} style={styles.hiddenCamera} facing="back" />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f9f9f9',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginTop: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6347',
    marginTop: 10,
  },
  subheader: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 10,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: 10,
    backgroundColor: '#FF6347',
    borderRadius: 6,
  },
  progressText: {
    fontSize: 14,
    color: '#FF6347',
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 2,
    textAlign: 'right',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  activeStep: {
    backgroundColor: '#ffece6',
    borderRadius: 8,
  },
  stepLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 14,
    flex: 1,
  },
  activeStepLabel: {
    color: '#FF6347',
    fontWeight: 'bold',
  },
  stepStatus: {
    fontSize: 14,
    color: '#888',
    marginLeft: 10,
    textTransform: 'capitalize',
  },
  successBox: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#e6fbe6',
    borderRadius: 10,
    padding: 16,
  },
  successText: {
    color: '#22c55e',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  errorBox: {
    marginTop: 30,
    alignItems: 'center',
    backgroundColor: '#fbeaea',
    borderRadius: 10,
    padding: 16,
  },
  errorText: {
    color: '#ef4444',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    left: -1000,
    top: -1000,
  },
});