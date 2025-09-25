// import React from 'react';
// import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

// export default function SOSButton({ onPress, isLoading }) {
//   return (
//     <TouchableOpacity style={styles.button} onPress={onPress} disabled={isLoading}>
//       {isLoading ? (
//         <ActivityIndicator color="#fff" size="large" />
//       ) : (
//         <Text style={styles.text}>SOS</Text>
//       )}
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     width: 200,
//     height: 200,
//     borderRadius: 100,
//     backgroundColor: '#FF6347',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 5,
//     elevation: 8,
//   },
//   text: {
//     color: '#fff',
//     fontSize: 48,
//     fontWeight: 'bold',
//   },
// });

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../assets/Colors'; 

const { width, height } = Dimensions.get('window');

const SOSScreen = () => {
  const [isPressed, setIsPressed] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [rippleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Continuous pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  const handleSOSPress = () => {
    setIsPressed(true);
    
    // Ripple effect
    Animated.timing(rippleAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      rippleAnim.setValue(0);
    });

    // Show confirmation alert
    Alert.alert(
      "Emergency SOS",
      "Are you sure you want to send an emergency alert?",
      [
        { text: "Cancel", style: "cancel", onPress: () => setIsPressed(false) },
        { text: "Send SOS", style: "destructive", onPress: sendSOS }
      ]
    );
  };

  const sendSOS = () => {
    // Implement your SOS logic here
    console.log("SOS Sent!");
    setIsPressed(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency SOS</Text>
        <Text style={styles.headerSubtitle}>
          Press and hold the button to send emergency alert
        </Text>
      </View>

      {/* Main SOS Button Area */}
      <View style={styles.sosContainer}>
        {/* Ripple Effect */}
        <Animated.View
          style={[
            styles.ripple,
            {
              transform: [
                {
                  scale: rippleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 2.5],
                  }),
                },
              ],
              opacity: rippleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.8, 0.3, 0],
              }),
            },
          ]}
        />

        {/* Outer Ring */}
        <View style={styles.outerRing}>
          {/* Middle Ring */}
          <View style={styles.middleRing}>
            {/* SOS Button */}
            <Animated.View
              style={[
                styles.sosButtonContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.sosButton,
                  isPressed && styles.sosButtonPressed,
                ]}
                onPress={handleSOSPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
                  style={styles.gradientButton}
                >
                  <Text style={styles.sosIcon}>!</Text>
                  <Text style={styles.sosText}>SOS</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Emergency Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Quick Actions</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📞 Call Emergency</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>📍 Share Location</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>💬 Send Alert Message</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Area */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Text style={styles.navButtonText}>👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DC2626',
  },
  
  header: {
    paddingTop: 20,
    paddingHorizontal: 30,
    paddingBottom: 30,
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  
  sosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  ripple: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  outerRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  middleRing: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  sosButtonContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  
  sosButton: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  
  sosButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  
  gradientButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  
  sosIcon: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '900',
    marginBottom: 5,
  },
  
  sosText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 2,
  },
  
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  
  infoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  actionButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
  },
  
  actionButtonText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingVertical: 15,
    paddingHorizontal: 30,
    justifyContent: 'space-around',
  },
  
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  
  navButtonText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default SOSScreen;