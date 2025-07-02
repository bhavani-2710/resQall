import React, { useRef, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type SOSButtonProps = {
  onPress: () => void;
  title?: string;
  disabled?: boolean;
  isEmergency?: boolean;
};

export default function SOSButton({ 
  onPress, 
  title = "SOS", 
  disabled = false,
  isEmergency = false 
}: SOSButtonProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isEmergency) {
      // Pulse animation for emergency state
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      
      // Glow animation
      const glow = Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      );

      pulse.start();
      glow.start();

      return () => {
        pulse.stop();
        glow.stop();
      };
    }
  }, [isEmergency, pulseAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <View style={styles.container}>
      {isEmergency && (
        <Animated.View 
          style={[
            styles.glowRing, 
            { opacity: glowOpacity }
          ]} 
        />
      )}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[styles.button, disabled && styles.disabled]}
          onPress={onPress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              disabled 
                ? ['#666', '#444']
                : isEmergency 
                ? ['#ff1744', '#d50000'] 
                : ['#e53935', '#c62828']
            }
            style={styles.gradient}
          >
            <Text style={[styles.text, disabled && styles.disabledText]}>
              {title}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 24,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    elevation: 2,
    shadowOpacity: 0.1,
  },
  disabledText: {
    color: '#ccc',
  },
  glowRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: '#ff1744',
    backgroundColor: 'transparent',
  },
});