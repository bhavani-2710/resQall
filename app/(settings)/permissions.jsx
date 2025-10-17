import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SettingsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    location: false,
    camera: false,
    audio: false,
    gallery: false,
  });

  const checkPermissions = async () => {
    const { status: locationStatus } = await Location.getForegroundPermissionsAsync();
    const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
    const { status: audioStatus } = await Camera.getMicrophonePermissionsAsync();
    const { status: galleryStatus } = await MediaLibrary.getPermissionsAsync();

    const all = {
      location: locationStatus === "granted",
      camera: cameraStatus === "granted",
      audio: audioStatus === "granted",
      gallery: galleryStatus === "granted",
    };

    setPermissions(all);

    const allGranted = Object.values(all).every(Boolean);
    await AsyncStorage.setItem("permissionsGranted", allGranted ? "true" : "false");
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      await checkPermissions();
    };
    fetchPermissions();
  }, []);

  const requestAgain = async (type) => {
    if (type === "location") await Location.requestForegroundPermissionsAsync();
    if (type === "camera") await Camera.requestCameraPermissionsAsync();
    if (type === "audio") await Camera.requestMicrophonePermissionsAsync();
    if (type === "gallery") await MediaLibrary.requestPermissionsAsync();
    checkPermissions();
  };

  const icons = {
    location: <Ionicons name="location" size={24} color="#5f8d4e" />,
    camera: <Ionicons name="camera" size={24} color="#4169E1" />,
    audio: <Ionicons name="mic" size={24} color="#7a4c36" />,
    gallery: <MaterialIcons name="photo-library" size={24} color="#0096FF" />,
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#1B1B1B", "#2A2A2A", "#3A3A3A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 px-5 pt-12"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Back Button */}
          <View className="flex flex-row items-center gap-5 mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="p-2 rounded-full border-2 border-[#E60023] bg-[#2A2A2A]"
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Header */}
          <Text className="text-3xl font-extrabold text-white mb-8">
            App Permissions
          </Text>

          {Object.keys(permissions).map((perm) => (
            <View
              key={perm}
              className="flex-row items-center justify-between bg-[#3a3a3a] rounded-xl px-5 py-3 mb-4"
            >
              <View className="flex-row items-center space-x-3">
                {icons[perm]}
                <Text className="text-white capitalize text-lg">{"  "}{perm}</Text>
              </View>

              {permissions[perm] ? (
                <Text className="text-green-500 text-lg font-semibold">Granted</Text>
              ) : (
                <TouchableOpacity
                  className="bg-[#E60023] px-5 py-2 rounded-full"
                  onPress={() => requestAgain(perm)}
                >
                  <Text className="text-white font-medium">Grant</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          <TouchableOpacity
            className="mt-10 bg-[#E60023] px-6 py-3 rounded-2xl shadow-lg"
            onPress={() => router.replace("/home")}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Go to Home
            </Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
