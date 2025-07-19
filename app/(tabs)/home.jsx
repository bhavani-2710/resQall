import { FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  const handleSOS = () => {
    router.push('/(emergency)/emergency');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Emergency SOS</Text>
      <Text style={styles.subtitle}>Press the button in case of an emergency</Text>
      <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.85}>
        <FontAwesome5 name="exclamation-circle" size={60} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 60,
  },
  sosButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#FF6347',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6347',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  sosText: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
    letterSpacing: 2,
  },
});
