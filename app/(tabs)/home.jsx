// import { FontAwesome5 } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// import { Text, TouchableOpacity, View } from "react-native";


// export default function HomeScreen() {
//   const router = useRouter();

//   const handleSOS = () => {
//     router.push("/emergency");
//   };

//   return (
//     <View className="flex-1 justify-center items-center bg-[#FFDEDE] px-5">
//       <Text className="text-3xl font-bold text-[#000000] mb-2">
//         Emergency SOS
//       </Text>
//       <Text className="text-base text-[#000000] opacity-70 text-center mb-16">
//         Press the button in case of an emergency
//       </Text>

//       <TouchableOpacity
//         onPress={handleSOS}
//         activeOpacity={0.85}
//         className="w-44 h-44 rounded-full justify-center items-center shadow-2xl"
//         style={{ backgroundColor: "#CF0F47", shadowColor: "#FF0B55" }}
//       >
//         <FontAwesome5 name="exclamation-circle" size={60} color="#fff" />
//         <Text className="text-white text-4xl font-bold mt-2 tracking-widest">
//           SOS
//         </Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
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

  const callEmergency = () => {
    Alert.alert("Calling Emergency", "Dialing emergency services...");
  };

  const shareLocation = () => {
    Alert.alert("Location Shared", "Your location has been shared with emergency contacts.");
  };

  const sendAlertMessage = () => {
    Alert.alert("Alert Sent", "Emergency message sent to all contacts.");
  };

  return (
    <SafeAreaView className="flex-1 bg-red-600">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />
      
      {/* Header */}
      <View className="pt-5 px-8 pb-8 items-center">
        <Text className="text-3xl font-extrabold text-white mb-2 tracking-wide">
          Emergency SOS
        </Text>
        <Text className="text-base text-white/80 text-center leading-6">
          Press the button to send emergency alert
        </Text>
      </View>

      {/* Main SOS Button Area */}
      <View className="flex-1 justify-center items-center relative">
        {/* Ripple Effect */}
        <Animated.View
          className="absolute w-80 h-80 rounded-full bg-white/20"
          style={{
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
          }}
        />

        {/* Outer Ring */}
        <View className="w-72 h-72 rounded-full bg-white/10 justify-center items-center border-2 border-white/30">
          {/* Middle Ring */}
          <View className="w-60 h-60 rounded-full bg-white/5 justify-center items-center">
            {/* SOS Button */}
            <Animated.View
              className="w-48 h-48 rounded-full shadow-2xl"
              style={{
                transform: [{ scale: pulseAnim }],
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 15,
              }}
            >
              <TouchableOpacity
                className="w-full h-full rounded-full overflow-hidden"
                onPress={handleSOSPress}
                activeOpacity={0.8}
                style={isPressed ? { transform: [{ scale: 0.95 }] } : {}}
              >
                <LinearGradient
                  colors={[Colors.light.gradientStart, Colors.light.gradientEnd]}
                  className="flex-1 justify-center items-center rounded-full"
                >
                  <Text className="text-5xl text-white font-black mb-1">!</Text>
                  <Text className="text-3xl text-white font-extrabold tracking-widest">SOS</Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </View>

      {/* Emergency Info */}
      <View className="px-5 pb-5">
        <View 
          className="bg-white/95 rounded-2xl p-5"
          style={{
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 10,
          }}
        >
          <Text className="text-xl font-bold text-gray-800 mb-4 text-center">
            Quick Actions
          </Text>
          
          <TouchableOpacity 
            className="bg-gray-100 rounded-xl p-4 mb-3 border-l-4 border-red-600"
            onPress={callEmergency}
          >
            <Text className="text-base text-gray-700 font-semibold">
              📞 Call Emergency
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-gray-100 rounded-xl p-4 mb-3 border-l-4 border-red-600"
            onPress={shareLocation}
          >
            <Text className="text-base text-gray-700 font-semibold">
              📍 Share Location
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="bg-gray-100 rounded-xl p-4 mb-2 border-l-4 border-red-600"
            onPress={sendAlertMessage}
          >
            <Text className="text-base text-gray-700 font-semibold">
              💬 Send Alert Message
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation Area */}
      <View className="flex-row bg-black/20 py-4 px-8 justify-around">
        <TouchableOpacity className="flex-1 items-center py-3">
          <Text className="text-white/80 text-sm font-semibold">🏠 Home</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-1 items-center py-3">
          <Text className="text-white/80 text-sm font-semibold">👤 Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SOSScreen;
