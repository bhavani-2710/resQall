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

export default function SettingsScreen() {
  const router = useRouter();
  const [permissions, setPermissions] = useState({
    location: false,
    camera: false,
    audio: false,
    gallery: false,
  });

  const checkPermissions = async () => {
    const { status: locationStatus } =
      await Location.getForegroundPermissionsAsync();
    const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
    const { status: audioStatus } =
      await Camera.getMicrophonePermissionsAsync();
    const { status: galleryStatus } = await MediaLibrary.getPermissionsAsync();

    const all = {
      location: locationStatus === "granted",
      camera: cameraStatus === "granted",
      audio: audioStatus === "granted",
      gallery: galleryStatus === "granted",
    };

    setPermissions(all);

    // Only mark "permissionsGranted" = true if ALL are granted
    const allGranted = Object.values(all).every(Boolean);
    await AsyncStorage.setItem(
      "permissionsGranted",
      allGranted ? "true" : "false"
    );
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

  // Icons map for each permission
  const icons = {
    location: <Ionicons name="location" size={24} color="#5f8d4e" />,
    camera: <Ionicons name="camera" size={24} color="#4169E1" />,
    audio: <Ionicons name="mic" size={24} color="#7a4c36" />,
    gallery: <MaterialIcons name="photo-library" size={24} color="#0096FF" />,
  };

  return (
    <SafeAreaView className="bg-[#FFDEDE] flex-1 px-5 pt-12">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Back Button */}
        <View className="flex flex-row items-center gap-5">
          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-full border-2 border-[#CF0F47] bg-white"
          >
            <Ionicons name="chevron-back" size={24} color="#28282B" />
          </TouchableOpacity>
        </View>

        {/* Header */}
        <Text className="flex text-3xl font-extrabold text-[#28282B] my-8 mx-1">
          Edit Emergency Contacts
        </Text>

        {Object.keys(permissions).map((perm) => (
          <View
            key={perm}
            className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 mb-4 shadow-md"
          >
            <View className="flex-row items-center space-x-3">
              {icons[perm]}
              <Text className="text-[#28282B] capitalize text-lg">
                {"  "}
                {perm}
              </Text>
            </View>

            {permissions[perm] ? (
              <Text className="text-green-600 text-lg font-semibold">
                Granted
              </Text>
            ) : (
              <TouchableOpacity
                className="bg-[#CF0F47] px-5 py-2 rounded-full"
                onPress={() => requestAgain(perm)}
              >
                <Text className="text-white font-medium">Grant</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity
          className="mt-10 bg-[#CF0F47] px-6 py-3 rounded-2xl shadow-lg"
          onPress={() => router.replace("/home")}
        >
          <Text className="text-white text-center text-lg font-semibold">
            Go to Home
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
