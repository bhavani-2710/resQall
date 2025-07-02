import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView
} from 'react-native';
import { EmergencyService } from '../services/emergencyService';

const { width, height } = Dimensions.get('window');

export default function Settings({ navigation }: any) {
  const [secret, setSecret] = useState('help me luna');
  const [phoneContacts, setPhoneContacts] = useState('');
  const [emailContacts, setEmailContacts] = useState('');
  const [enableVoice, setEnableVoice] = useState(true);
  const [autoPhoto, setAutoPhoto] = useState(true);
  const [autoAudio, setAutoAudio] = useState(true);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  
  // Focus states for inputs
  const [secretInputFocused, setSecretInputFocused] = useState(false);
  const [phoneInputFocused, setPhoneInputFocused] = useState(false);
  const [emailInputFocused, setEmailInputFocused] = useState(false);
  
  // Animation values - simplified
  const fadeAnim = new Animated.Value(1); // Start with 1 to avoid blank screen
  const slideAnim = new Animated.Value(0); // Start with 0 to avoid layout issues
  const scaleAnim = new Animated.Value(1); // Start with 1 for immediate visibility

  useEffect(() => {
    loadSettings();
    
    // Simplified entrance animation - start visible to avoid blank screen
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Keyboard listeners
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardWillShowListener?.remove();
      keyboardWillHideListener?.remove();
    };
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Phone contacts:', phoneContacts);
    console.log('Email contacts:', emailContacts);
    console.log('Secret phrase:', secret);
  }, [phoneContacts, emailContacts, secret]);

  const loadSettings = async () => {
    try {
      const [savedSecret, savedPhones, savedEmails, savedVoice, savedPhoto, savedAudio] = await Promise.all([
        AsyncStorage.getItem('secretPhrase'),
        AsyncStorage.getItem('emergencyContacts'),
        AsyncStorage.getItem('emergencyEmails'),
        AsyncStorage.getItem('enableVoice'),
        AsyncStorage.getItem('autoPhoto'),
        AsyncStorage.getItem('autoAudio'),
      ]);

      if (savedSecret) setSecret(savedSecret);
      if (savedPhones) setPhoneContacts(savedPhones);
      if (savedEmails) setEmailContacts(savedEmails);
      if (savedVoice !== null) setEnableVoice(JSON.parse(savedVoice));
      if (savedPhoto !== null) setAutoPhoto(JSON.parse(savedPhoto));
      if (savedAudio !== null) setAutoAudio(JSON.parse(savedAudio));
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleSave = async () => {
    if (!secret.trim()) {
      Alert.alert('Error', 'Secret phrase cannot be empty');
      return;
    }

    if (!phoneContacts.trim() && !emailContacts.trim()) {
      Alert.alert(
        'Warning',
        'No emergency contacts configured. The app will not be able to send alerts.',
        [
          { text: 'Continue anyway', onPress: () => saveSettings() },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } else {
      saveSettings();
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      await Promise.all([
        AsyncStorage.setItem('secretPhrase', secret.trim()),
        AsyncStorage.setItem('emergencyContacts', phoneContacts.trim()),
        AsyncStorage.setItem('emergencyEmails', emailContacts.trim()),
        AsyncStorage.setItem('enableVoice', JSON.stringify(enableVoice)),
        AsyncStorage.setItem('autoPhoto', JSON.stringify(autoPhoto)),
        AsyncStorage.setItem('autoAudio', JSON.stringify(autoAudio)),
      ]);

      // Success animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert('Success', 'Settings saved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSystem = async () => {
    if (!phoneContacts.trim() && !emailContacts.trim()) {
      Alert.alert('Error', 'Please configure at least one emergency contact first');
      return;
    }

    setTesting(true);
    try {
      const emergencyService = EmergencyService.getInstance();
      const success = await emergencyService.testEmergencySystem();
      
      if (success) {
        Alert.alert(
          'Test Successful',
          'Test messages sent to your emergency contacts. Please check if they received the test alert.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Test Failed', 'Could not send test messages. Please check your settings.');
      }
    } catch (error) {
      Alert.alert('Test Failed', 'An error occurred while testing the system.');
    } finally {
      setTesting(false);
    }
  };

  const validatePhoneContacts = (text: string) => {
    if (!text.trim()) return null;
    const contacts = text.split(',').map(c => c.trim()).filter(Boolean);
    const invalidContacts = contacts.filter(contact => 
      !/^[\+]?[1-9][\d]{3,14}$/.test(contact.replace(/\s/g, ''))
    );
    
    if (invalidContacts.length > 0) {
      return `Invalid phone numbers: ${invalidContacts.join(', ')}`;
    }
    return null;
  };

  const validateEmailContacts = (text: string) => {
    if (!text.trim()) return null;
    const emails = text.split(',').map(e => e.trim()).filter(Boolean);
    const invalidEmails = emails.filter(email => 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    );
    
    if (invalidEmails.length > 0) {
      return `Invalid email addresses: ${invalidEmails.join(', ')}`;
    }
    return null;
  };

  const phoneError = phoneContacts ? validatePhoneContacts(phoneContacts) : null;
  const emailError = emailContacts ? validateEmailContacts(emailContacts) : null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#0F0C29', '#24243e', '#302B63', '#0F0C29']}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.gradient}
      >
        {/* Custom Header */}
        <View style={styles.headerContainer}>
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <View style={styles.headerContent}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <BlurView intensity={20} style={styles.blurButton}>
                  <Ionicons name="arrow-back" size={24} color="#fff" />
                </BlurView>
              </TouchableOpacity>
              
              <View style={styles.titleContainer}>
                <View style={styles.logoContainer}>
                  <Ionicons name="shield-checkmark" size={32} color="#00E5FF" />
                </View>
                <Text style={styles.title}>ResQall</Text>
                <Text style={styles.subtitle}>Emergency Guardian</Text>
              </View>
              
              <TouchableOpacity
                style={styles.testButton}
                onPress={handleTestSystem}
                disabled={testing}
              >
                <BlurView intensity={20} style={styles.blurButton}>
                  {testing ? (
                    <ActivityIndicator size="small" color="#00E5FF" />
                  ) : (
                    <Ionicons name="rocket" size={20} color="#00E5FF" />
                  )}
                </BlurView>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        {/* Main Content with KeyboardAvoidingView */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContainer,
              { paddingBottom: keyboardVisible ? 20 : 120 }
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            nestedScrollEnabled={true}
          >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
              {/* Voice Activation Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="mic" size={24} color="#FF6B6B" />
                  </View>
                  <Text style={styles.sectionTitle}>Voice Activation</Text>
                </View>
                
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.label}>🎙️ Secret Voice Phrase</Text>
                    <TextInput
                      value={secret}
                      onChangeText={(text) => {
                        console.log('Secret phrase changed:', text);
                        setSecret(text);
                      }}
                      style={[
                        styles.textInput,
                        secretInputFocused && styles.textInputFocused
                      ]}
                      placeholder="Enter your secret phrase..."
                      placeholderTextColor="#999999"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => {
                        console.log('Secret input focused');
                        setSecretInputFocused(true);
                      }}
                      onBlur={() => {
                        console.log('Secret input blurred');
                        setSecretInputFocused(false);
                      }}
                      selectionColor="#00E5FF"
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    <Text style={styles.hint}>
                      Say this phrase to automatically trigger emergency mode
                    </Text>
                    
                    <View style={styles.switchRow}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>Enable Voice Recognition</Text>
                        <Text style={styles.switchHint}>Listen for emergency phrase continuously</Text>
                      </View>
                      <Switch
                        value={enableVoice}
                        onValueChange={setEnableVoice}
                        trackColor={{ false: '#333', true: '#FF6B6B' }}
                        thumbColor={enableVoice ? '#fff' : '#666'}
                        ios_backgroundColor="#333"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* Emergency Contacts Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="people" size={24} color="#4ECDC4" />
                  </View>
                  <Text style={styles.sectionTitle}>Emergency Contacts</Text>
                </View>
                
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.label}>📱 Phone Numbers</Text>
                    <TextInput
                      value={phoneContacts}
                      onChangeText={(text) => {
                        console.log('Phone contacts changed:', text);
                        setPhoneContacts(text);
                      }}
                      style={[
                        styles.textInput, 
                        styles.multilineInput,
                        phoneInputFocused && styles.textInputFocused
                      ]}
                      placeholder="e.g., +1234567890, +0987654321"
                      placeholderTextColor="#999999"
                      multiline
                      keyboardType="phone-pad"
                      onFocus={() => {
                        console.log('Phone input focused');
                        setPhoneInputFocused(true);
                      }}
                      onBlur={() => {
                        console.log('Phone input blurred');
                        setPhoneInputFocused(false);
                      }}
                      selectionColor="#00E5FF"
                      autoCorrect={false}
                      spellCheck={false}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    {phoneError && (
                      <Text style={styles.errorText}>{phoneError}</Text>
                    )}
                    <Text style={styles.hint}>
                      Separate multiple numbers with commas. Include country code for international numbers.
                    </Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.label}>📧 Email Addresses</Text>
                    <TextInput
                      value={emailContacts}
                      onChangeText={(text) => {
                        console.log('Email contacts changed:', text);
                        setEmailContacts(text);
                      }}
                      style={[
                        styles.textInput, 
                        styles.multilineInput,
                        emailInputFocused && styles.textInputFocused
                      ]}
                      placeholder="e.g., emergency@family.com, friend@email.com"
                      placeholderTextColor="#999999"
                      multiline
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onFocus={() => {
                        console.log('Email input focused');
                        setEmailInputFocused(true);
                      }}
                      onBlur={() => {
                        console.log('Email input blurred');
                        setEmailInputFocused(false);
                      }}
                      selectionColor="#00E5FF"
                      autoCorrect={false}
                      spellCheck={false}
                      returnKeyType="done"
                      blurOnSubmit={true}
                      onSubmitEditing={() => Keyboard.dismiss()}
                    />
                    {emailError && (
                      <Text style={styles.errorText}>{emailError}</Text>
                    )}
                    <Text style={styles.hint}>
                      Separate multiple emails with commas. Photos and audio will be attached automatically.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Emergency Data Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="camera" size={24} color="#FFD93D" />
                  </View>
                  <Text style={styles.sectionTitle}>Emergency Data</Text>
                </View>
                
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <View style={styles.switchRow}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>📸 Auto-capture Photo</Text>
                        <Text style={styles.switchHint}>Take photo during emergency for evidence</Text>
                      </View>
                      <Switch
                        value={autoPhoto}
                        onValueChange={setAutoPhoto}
                        trackColor={{ false: '#333', true: '#FFD93D' }}
                        thumbColor={autoPhoto ? '#fff' : '#666'}
                        ios_backgroundColor="#333"
                      />
                    </View>

                    <View style={styles.switchRow}>
                      <View style={styles.switchInfo}>
                        <Text style={styles.switchLabel}>🎵 Auto-record Audio</Text>
                        <Text style={styles.switchHint}>Record 30 seconds of ambient audio</Text>
                      </View>
                      <Switch
                        value={autoAudio}
                        onValueChange={setAutoAudio}
                        trackColor={{ false: '#333', true: '#FFD93D' }}
                        thumbColor={autoAudio ? '#fff' : '#666'}
                        ios_backgroundColor="#333"
                      />
                    </View>
                  </View>
                </View>
              </View>

              {/* About Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="information-circle" size={24} color="#A8E6CF" />
                  </View>
                  <Text style={styles.sectionTitle}>About ResQall</Text>
                </View>
                
                <View style={styles.card}>
                  <View style={styles.cardContent}>
                    <Text style={styles.aboutText}>
                      🛡️ <Text style={styles.boldText}>ResQall</Text> is your personal emergency response system designed to quickly alert your trusted contacts when you need help most.
                    </Text>
                    <Text style={styles.aboutText}>
                      🚨 In emergency situations, ResQall automatically captures your location, takes a photo, records audio, and sends all this information to your emergency contacts via SMS and email.
                    </Text>
                    <Text style={styles.aboutText}>
                      💡 <Text style={styles.boldText}>Pro Tip:</Text> Test your system regularly to ensure it works when you need it most. Your safety is our priority.
                    </Text>
                  </View>
                </View>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Fixed Footer - Only show when keyboard is hidden */}
        {!keyboardVisible && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.disabledButton]}
              onPress={handleSave}
              disabled={loading}
            >
              <LinearGradient
                colors={loading ? ['#666', '#444'] : ['#00E5FF', '#0091EA']}
                style={styles.saveButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={24} color="#fff" />
                    <Text style={styles.saveButtonText}>Save Settings</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0,
    paddingBottom: 10,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  blurButton: {
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  titleContainer: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,229,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#00E5FF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00E5FF',
    textShadowColor: 'rgba(0,229,255,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0BEC5',
    marginTop: 4,
    fontWeight: '500',
  },
  testButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    borderRadius: 20,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardContent: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 15,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    minHeight: 50,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlignVertical: 'center',
  },
  textInputFocused: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: '#00E5FF',
    borderWidth: 2,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  hint: {
    fontSize: 12,
    color: '#00E5FF',
    marginTop: 10,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#FF5252',
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  switchInfo: {
    flex: 1,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  switchHint: {
    fontSize: 12,
    color: '#B0BEC5',
    marginTop: 4,
  },
  aboutText: {
    fontSize: 14,
    color: '#B0BEC5',
    lineHeight: 22,
    marginBottom: 12,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 10,
    backgroundColor: 'rgba(15, 12, 41, 0.9)',
  },
  saveButton: {
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  disabledButton: {
    elevation: 0,
    shadowOpacity: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});