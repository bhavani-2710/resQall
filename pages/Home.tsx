import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../services/firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Custom ResQall Logo Component
const ResQallLogo = ({ size = 60 }) => (
  <View style={[styles.logoContainer, { width: size, height: size }]}>
    <LinearGradient
      colors={['#64ffda', '#00bcd4', '#0097a7']}
      style={[styles.logoGradient, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={styles.logoInner}>
        <Ionicons name="shield-checkmark" size={size * 0.6} color="#fff" />
      </View>
      <View style={[styles.logoRing, { width: size + 8, height: size + 8, borderRadius: (size + 8) / 2 }]} />
    </LinearGradient>
  </View>
);

// Add type for navigation prop
interface NavigationProp {
  navigate: (screen: string) => void;
}

export default function ResQallHome({ navigation }: { navigation: NavigationProp }) {
  const [isListening, setIsListening] = useState(true);
  const [hasContacts, setHasContacts] = useState(false);
  const [userName, setUserName] = useState('');
  const [secretPhrase, setSecretPhrase] = useState('help me resqall');
  const [voiceStatus, setVoiceStatus] = useState('🎤 Listening for emergency phrase...');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const floatingAnim1 = useRef(new Animated.Value(0)).current;
  const floatingAnim2 = useRef(new Animated.Value(0)).current;
  const sosScaleAnim = useRef(new Animated.Value(1)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  const startAnimations = useCallback(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Pulse animation for SOS button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 20000,
        useNativeDriver: true,
      })
    ).start();

    // Floating background elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim1, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim1, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(floatingAnim2, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(floatingAnim2, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim, fadeAnim, floatingAnim1, floatingAnim2, logoRotateAnim]);

  useEffect(() => {
    startAnimations();
    
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Load user data
    loadUserData();

    return () => clearInterval(timer);
  }, [startAnimations]);

  const loadUserData = async () => {
    try {
      const [savedUserName, savedContacts, savedSecret] = await Promise.all([
        AsyncStorage.getItem('userName'),
        AsyncStorage.getItem('emergencyContacts'),
        AsyncStorage.getItem('secretPhrase')
      ]);
      
      if (savedUserName) setUserName(savedUserName);
      if (savedSecret) setSecretPhrase(savedSecret);
      setHasContacts(!!savedContacts && savedContacts.trim().length > 0);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const handleSOSPress = () => {
    // Scale animation feedback
    Animated.sequence([
      Animated.timing(sosScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sosScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (!hasContacts) {
      Alert.alert(
        '⚠️ No Emergency Contacts',
        'Please configure emergency contacts in Settings before using SOS.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Setup Now', 
            onPress: () => navigation?.navigate('Settings'),
            style: 'default'
          }
        ]
      );
      return;
    }
    
    sendSosMessage();
    
    navigation?.navigate('Emergency');
  };

     const sendSosMessage = async () => {
    try {
      await addDoc(collection(db, 'sosMessages'), {
        name: userName || 'Anonymous',
        message: 'Help me, please!',
        time: new Date().toISOString()
      });
      console.log(' SOS sent to Firestore!');
    } catch (error) {
      console.error('Error sending SOS:', error);
    }
  };


  const handleVoiceToggle = () => {
    const newListeningState = !isListening;
    setIsListening(newListeningState);
    setVoiceStatus(newListeningState ? '🎤 Listening for emergency phrase...' : 'Voice recognition disabled');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const logoRotation = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Floating Background Elements */}
        <Animated.View 
          style={[
            styles.floatingElement1,
            {
              transform: [{
                translateY: floatingAnim1.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50]
                })
              }]
            }
          ]} 
        />
        <Animated.View 
          style={[
            styles.floatingElement2,
            {
              transform: [{
                translateY: floatingAnim2.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 30]
                })
              }]
            }
          ]} 
        />

        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.appNameContainer}>
                <Animated.View 
                  style={[
                    styles.logoWrapper,
                    { transform: [{ rotate: logoRotation }] }
                  ]}
                >
                  <ResQallLogo size={80} />
                </Animated.View>
                
                <Text style={styles.appName}>
                  Res<Text style={styles.appNameAccent}>Q</Text>all
                </Text>
                <Text style={styles.tagline}>Your Guardian Angel</Text>
              </View>
              
              <View style={styles.greetingContainer}>
                <Text style={styles.greeting}>
                  {getGreeting()}{userName ? `, ${userName}` : ''}
                </Text>
                <Text style={styles.subtitle}>Stay safe, stay protected</Text>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              </View>
            </View>

            {/* Main SOS Section */}
            <View style={styles.mainContent}>
              <Animated.View 
                style={[
                  styles.sosContainer,
                  { 
                    transform: [
                      { scale: Animated.multiply(pulseAnim, sosScaleAnim) }
                    ] 
                  }
                ]}
              >
                {/* Pulse Rings */}
                {isListening && (
                  <>
                    <Animated.View 
                      style={[
                        styles.pulseRing,
                        styles.pulseRing1,
                        {
                          transform: [{ scale: pulseAnim }],
                          opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: [0.7, 0]
                          })
                        }
                      ]} 
                    />
                    <Animated.View 
                      style={[
                        styles.pulseRing,
                        styles.pulseRing2,
                        {
                          transform: [{ scale: pulseAnim }],
                          opacity: pulseAnim.interpolate({
                            inputRange: [1, 1.05],
                            outputRange: [0.5, 0]
                          })
                        }
                      ]} 
                    />
                  </>
                )}
                
                <TouchableOpacity
                  style={styles.sosButton}
                  onPress={handleSOSPress}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#ff4757', '#ff3742']}
                    style={styles.sosButtonGradient}
                  >
                    <View style={styles.sosButtonInner}>
                      <Text style={styles.sosText}>SOS</Text>
                      <Text style={styles.emergencyText}>EMERGENCY</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
              
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>
                  Press and hold for 3 seconds or say
                </Text>
                <View style={styles.phraseContainer}>
                  <Text style={styles.phraseText}>"{secretPhrase}"</Text>
                </View>
              </View>
            </View>

            {/* Status Panel */}
            <BlurView intensity={20} tint="light" style={styles.statusPanel}>
              <View style={styles.statusContainer}>
                {/* Voice Recognition Status */}
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusIcon,
                    { backgroundColor: isListening ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)' }
                  ]}>
                    <Ionicons 
                      name={isListening ? "mic" : "mic-off"} 
                      size={24} 
                      color={isListening ? '#4CAF50' : '#F44336'} 
                    />
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text style={styles.statusTitle}>Voice Recognition</Text>
                    <Text style={styles.statusText}>{voiceStatus}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.toggleButton}
                    onPress={handleVoiceToggle}
                  >
                    <Text style={styles.toggleButtonText}>
                      {isListening ? 'Disable' : 'Enable'}
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.statusDivider} />
                
                {/* Emergency Contacts Status */}
                <View style={styles.statusItem}>
                  <View style={[
                    styles.statusIcon,
                    { backgroundColor: hasContacts ? 'rgba(76, 175, 80, 0.2)' : 'rgba(255, 152, 0, 0.2)' }
                  ]}>
                    <Ionicons 
                      name={hasContacts ? "shield-checkmark" : "shield-outline"} 
                      size={24} 
                      color={hasContacts ? '#4CAF50' : '#FF9800'} 
                    />
                  </View>
                  <View style={styles.statusTextContainer}>
                    <Text style={styles.statusTitle}>Emergency Contacts</Text>
                    <Text style={styles.statusText}>
                      {hasContacts ? "Configured & Ready" : "Setup Required"}
                    </Text>
                  </View>
                  {!hasContacts && (
                    <Ionicons name="warning" size={20} color="#FF9800" />
                  )}
                </View>
              </View>
            </BlurView>

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation?.navigate('Settings')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="settings" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Settings</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation?.navigate('History')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="time" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>History</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation?.navigate('Test')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']}
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                  <Text style={styles.actionButtonText}>Test</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Emergency Info Bar */}
            <View style={styles.emergencyBar}>
              <View style={styles.emergencyInfo}>
                <View style={styles.emergencyLeft}>
                  <Ionicons name="call" size={20} color="#ffcdd2" />
                  <Text style={styles.emergencyNumber}>Emergency: 911</Text>
                </View>
                <View style={styles.emergencyRight}>
                  <View style={styles.emergencyDetail}>
                    <Ionicons name="people" size={16} color="#ffcdd2" />
                    <Text style={styles.emergencyDetailText}>
                      {hasContacts ? '3' : '0'} contacts
                    </Text>
                  </View>
                  <View style={styles.emergencyDetail}>
                    <Ionicons name="location" size={16} color="#ffcdd2" />
                    <Text style={styles.emergencyDetailText}>GPS Ready</Text>
                  </View>
                </View>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  floatingElement1: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(138, 43, 226, 0.1)',
  },
  floatingElement2: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(30, 144, 255, 0.08)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 30,
    alignItems: 'center',
  },
  appNameContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#64ffda',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(100, 255, 218, 0.3)',
    top: -4,
    left: -4,
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 3,
  },
  appNameAccent: {
    color: '#64ffda',
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
    fontWeight: '300',
  },
  greetingContainer: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  timeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '300',
  },
  mainContent: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  sosContainer: {
    position: 'relative',
    marginBottom: 40,
  },
  pulseRing: {
    position: 'absolute',
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#ff4757',
  },
  pulseRing1: {
    width: 220,
    height: 220,
    top: -10,
    left: -10,
  },
  pulseRing2: {
    width: 240,
    height: 240,
    top: -20,
    left: -20,
  },
  sosButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#ff4757',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  sosButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#ff6b7a',
  },
  sosButtonInner: {
    alignItems: 'center',
  },
  sosText: {
    fontSize: 42,
    fontWeight: 'black',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
    letterSpacing: 2,
  },
  emergencyText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '600',
    letterSpacing: 1,
    marginTop: 2,
  },
  instructionContainer: {
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '300',
  },
  phraseContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  phraseText: {
    color: '#64ffda',
    fontWeight: '600',
    fontSize: 16,
  },
  statusPanel: {
    marginVertical: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statusContainer: {
    padding: 20,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '300',
  },
  toggleButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  statusDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  emergencyBar: {
    marginBottom: 20,
  },
  emergencyInfo: {
    backgroundColor: 'rgba(244, 67, 54, 0.15)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.2)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emergencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyNumber: {
    color: '#ffcdd2',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  emergencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
  },
  emergencyDetailText: {
    color: '#ffcdd2',
    fontSize: 12,
    marginLeft: 4,
    fontWeight: '400',
  },
});