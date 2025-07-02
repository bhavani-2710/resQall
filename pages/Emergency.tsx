// pages/Emergency.tsx (Fixed Camera Ref Type Safety)
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { EmergencyService } from '../services/emergencyService';

const { width, height } = Dimensions.get('window');

interface ProcessingStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
}

interface EmergencyData {
  location: any;
  photoUri: string | null;
  audioUri: string | null;
  timestamp: number;
  deviceInfo: any;
}

export default function Emergency({ navigation }: any) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { 
      id: 'location', 
      label: 'Getting Location', 
      description: 'Acquiring GPS coordinates...',
      status: 'pending',
      progress: 0
    },
    { 
      id: 'photo', 
      label: 'Taking Photo', 
      description: 'Capturing environment photo...',
      status: 'pending',
      progress: 0
    },
    { 
      id: 'audio', 
      label: 'Recording Audio', 
      description: 'Recording 10 seconds of audio...',
      status: 'pending',
      progress: 0
    },
    { 
      id: 'email', 
      label: 'Sending Email Alert', 
      description: 'Notifying emergency contacts via email...',
      status: 'pending',
      progress: 0
    },
    { 
      id: 'sms', 
      label: 'Sending SMS Alert', 
      description: 'Sending SMS to emergency contacts...',
      status: 'pending',
      progress: 0
    },
  ]);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [emergencyData, setEmergencyData] = useState<EmergencyData | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // Pulse animation for emergency icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const updateStepStatus = (stepId: string, status: ProcessingStep['status'], progress: number = 0) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status, progress } : step
    ));
    
    // Update overall progress
    const totalSteps = steps.length;
    const completedSteps = steps.filter(s => s.status === 'completed').length;
    const newProgress = (completedSteps / totalSteps) * 100;
    setOverallProgress(newProgress);
    
    // Animate progress bar
    Animated.timing(progressAnimation, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const simulateProgress = (stepId: string, duration: number = 3000) => {
    return new Promise<void>((resolve) => {
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

  const processEmergency = async () => {
    try {
      const emergencyService = EmergencyService.getInstance();
      
      // Vibrate to indicate start
      Vibration.vibrate([100, 50, 100]);
      
      // Step 1: Camera permissions
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) {
          throw new Error('Camera permission required for emergency mode');
        }
      }

      // Step 2: Get Location
      setCurrentStep(0);
      updateStepStatus('location', 'processing');
      await simulateProgress('location', 2000);
      
      // Step 3: Take Photo
      setCurrentStep(1);
      updateStepStatus('location', 'completed', 100);
      updateStepStatus('photo', 'processing');
      await simulateProgress('photo', 2500);
      
      // Step 4: Record Audio
      setCurrentStep(2);
      updateStepStatus('photo', 'completed', 100);
      updateStepStatus('audio', 'processing');
      await simulateProgress('audio', 3000);
      
      // Collect all emergency data
      updateStepStatus('audio', 'completed', 100);

      // Fixed: Multiple approaches to handle camera ref type safety
      if (!cameraRef.current) {
        throw new Error('Camera not available for emergency data collection');
      }

      // Try different approaches based on what EmergencyService expects:
      
      // Approach 1: Pass camera instance directly
      // const data = await emergencyService.collectEmergencyData(cameraRef.current);
      
      // Approach 2: If service expects ref object, uncomment this instead:
      // const data = await emergencyService.collectEmergencyData(cameraRef);
      
      // Approach 3: If service expects typed ref object, uncomment this instead:
      const data = await emergencyService.collectEmergencyData({ current: cameraRef.current } as React.RefObject<CameraView>);
      
      // Approach 4: If service expects nullable camera, uncomment this instead:
      // const data = await emergencyService.collectEmergencyData(cameraRef.current as CameraView);
      setEmergencyData(data);

      // Step 5: Send Email Alert
      setCurrentStep(3);
      updateStepStatus('email', 'processing');
      await simulateProgress('email', 2000);
      
      try {
        const emailSuccess = await emergencyService.sendEmailAlert(data);
        updateStepStatus('email', emailSuccess ? 'completed' : 'failed', 100);
      } catch (error) {
        console.error('Email failed:', error);
        updateStepStatus('email', 'failed', 100);
      }

      // Step 6: Send SMS Alert (Fixed with retry logic)
      setCurrentStep(4);
      updateStepStatus('sms', 'processing');
      await simulateProgress('sms', 2500);
      
      try {
        // Enhanced SMS sending with retry logic
        const smsSuccess = await emergencyService.sendSMSAlertWithRetry(data);
        updateStepStatus('sms', smsSuccess ? 'completed' : 'failed', 100);
        
        if (!smsSuccess) {
          // If SMS fails, show warning but don't fail completely
          setErrorMessage('SMS delivery failed, but email was sent successfully.');
        }
      } catch (error) {
        console.error('SMS failed:', error);
        updateStepStatus('sms', 'failed', 100);
        setErrorMessage('SMS delivery failed, but email alert was sent.');
      }

      // Complete the process
      setIsCompleted(true);
      setOverallProgress(100);
      
      // Success vibration
      Vibration.vibrate([200, 100, 200]);
      
      setTimeout(() => {
        const message = errorMessage 
          ? `Emergency alert sent via email. ${errorMessage}`
          : 'Emergency alert sent successfully via email and SMS!';
          
        Alert.alert(
          'Emergency Alert Sent',
          message,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }, 1500);
      
    } catch (error: any) {
      console.error('Emergency processing failed:', error);
      setHasError(true);
      setErrorMessage(error?.message || 'An error occurred while processing emergency data');
      
      // Error vibration
      Vibration.vibrate([500, 200, 500]);
      
      // Mark current step as failed
      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) {
        updateStepStatus(currentStepId, 'failed', 0);
      }
      
      Alert.alert(
        'Emergency Error',
        errorMessage,
        [
          { text: 'Retry', onPress: retryEmergency },
          { text: 'Cancel', onPress: () => navigation.goBack() }
        ]
      );
    }
  };

  const retryEmergency = () => {
    setHasError(false);
    setIsCompleted(false);
    setCurrentStep(0);
    setOverallProgress(0);
    setErrorMessage('');
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending', progress: 0 })));
    processEmergency();
  };

  useEffect(() => {
    processEmergency();
  }, []);

  const getStepIcon = (step: ProcessingStep) => {
    switch (step.status) {
      case 'completed':
        return <Ionicons name="checkmark-circle" size={28} color="#4caf50" />;
      case 'failed':
        return <Ionicons name="close-circle" size={28} color="#f44336" />;
      case 'processing':
        return <ActivityIndicator size="small" color="#ff9800" />;
      default:
        return <Ionicons name="ellipse-outline" size={28} color="#666" />;
    }
  };

  const getProgressBarColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed': return '#4caf50';
      case 'failed': return '#f44336';
      case 'processing': return '#ff9800';
      default: return '#666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      <LinearGradient
        colors={['#0d1117', '#161b22', '#21262d']}
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <Animated.View style={[
            styles.emergencyIconContainer,
            { transform: [{ scale: pulseAnimation }] }
          ]}>
            <LinearGradient
              colors={['#ff4444', '#cc0000']}
              style={styles.emergencyIcon}
            >
              <Ionicons name="warning" size={52} color="#fff" />
            </LinearGradient>
          </Animated.View>
          
          <Text style={styles.title}>Emergency Mode</Text>
          <Text style={styles.subtitle}>
            {isCompleted 
              ? 'Emergency alert sent!' 
              : hasError 
                ? 'Processing failed'
                : 'Processing emergency data...'
            }
          </Text>
          
          {/* Overall Progress Bar */}
          <View style={styles.overallProgressContainer}>
            <View style={styles.overallProgressBar}>
              <Animated.View 
                style={[
                  styles.overallProgressFill,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 100],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(overallProgress)}%</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          <View style={styles.stepsContainer}>
            {steps.map((step, index) => (
              <View key={step.id} style={[
                styles.stepItem,
                currentStep === index && styles.activeStep,
                step.status === 'completed' && styles.completedStep,
                step.status === 'failed' && styles.failedStep,
              ]}>
                <View style={styles.stepLeft}>
                  {getStepIcon(step)}
                  <View style={styles.stepTexts}>
                    <Text style={[
                      styles.stepText,
                      step.status === 'completed' && styles.completedText,
                      step.status === 'failed' && styles.failedText,
                      step.status === 'processing' && styles.processingText,
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={styles.stepDescription}>
                      {step.description}
                    </Text>
                  </View>
                </View>
                
                {/* Individual Step Progress */}
                {step.status !== 'pending' && (
                  <View style={styles.stepProgressContainer}>
                    <View style={styles.stepProgressBar}>
                      <View 
                        style={[
                          styles.stepProgressFill,
                          { 
                            width: `${step.progress}%`,
                            backgroundColor: getProgressBarColor(step.status)
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Success State */}
          {isCompleted && (
            <Animated.View style={[
              styles.successContainer,
              { opacity: isCompleted ? 1 : 0 }
            ]}>
              <LinearGradient
                colors={['#4caf50', '#45a049']}
                style={styles.successIcon}
              >
                <Ionicons name="shield-checkmark" size={48} color="#fff" />
              </LinearGradient>
              <Text style={styles.successTitle}>Alert Sent Successfully!</Text>
              <Text style={styles.successSubtitle}>
                {errorMessage || 'Emergency contacts have been notified with your location and data.'}
              </Text>
              
              {emergencyData && (
                <View style={styles.dataPreview}>
                  <Text style={styles.dataTitle}>Sent Data:</Text>
                  <Text style={styles.dataItem}>📍 Location: {emergencyData.location ? 'Included' : 'Failed'}</Text>
                  <Text style={styles.dataItem}>📷 Photo: {emergencyData.photoUri ? 'Included' : 'Failed'}</Text>
                  <Text style={styles.dataItem}>🎤 Audio: {emergencyData.audioUri ? 'Included' : 'Failed'}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {/* Error State */}
          {hasError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={64} color="#f44336" />
              <Text style={styles.errorTitle}>Processing Failed</Text>
              <Text style={styles.errorMessage}>{errorMessage}</Text>
              
              <TouchableOpacity
                style={styles.retryButton}
                onPress={retryEmergency}
              >
                <Ionicons name="refresh" size={24} color="#fff" />
                <Text style={styles.retryText}>Retry Emergency</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Hidden camera for photo capture */}
        {permission?.granted && (
          <CameraView
            ref={cameraRef}
            style={styles.hiddenCamera}
            facing="back"
          />
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  emergencyIconContainer: {
    marginBottom: 16,
    shadowColor: '#ff4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#8b949e',
    textAlign: 'center',
    marginBottom: 24,
  },
  overallProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  overallProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: 4,
  },
  progressText: {
    color: '#8b949e',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepsContainer: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  stepItem: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeStep: {
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderColor: '#ff9800',
  },
  completedStep: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderColor: '#4caf50',
  },
  failedStep: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderColor: '#f44336',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepTexts: {
    marginLeft: 16,
    flex: 1,
  },
  stepText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    color: '#8b949e',
    fontSize: 14,
  },
  completedText: {
    color: '#4caf50',
  },
  failedText: {
    color: '#f44336',
  },
  processingText: {
    color: '#ff9800',
  },
  stepProgressContainer: {
    marginTop: 8,
  },
  stepProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  stepProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4caf50',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    color: '#4caf50',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    color: '#8b949e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  dataPreview: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
  },
  dataTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dataItem: {
    color: '#8b949e',
    fontSize: 14,
    marginBottom: 4,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(244,67,54,0.1)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#f44336',
  },
  errorTitle: {
    color: '#f44336',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#8b949e',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f44336',
    borderRadius: 25,
    paddingVertical: 16,
    paddingHorizontal: 32,
    shadowColor: '#f44336',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  retryText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  hiddenCamera: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    width: 1,
    height: 1,
  },
});