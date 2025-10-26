import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Text,
  View,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../assets/images/logo.png";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldShowBanner: true,
    shouldSetBadge: false,
  }),
});

export default function Index() {
  const router = useRouter();
  const { user, isLoggedIn, authLoading, loadUserProfile } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState("");

  // 🔹 Register for push notifications
  useEffect(() => {
    const registerPush = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Please enable notifications for ResQall SOS alerts.");
        return;
      }

      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      setExpoPushToken(tokenData.data);
      console.log("Expo Push Token:", tokenData.data);
    };

    registerPush();
  }, []);

  // 🔹 Fetch user from local storage
  const fetchUser = async () => {
    const savedUID = await AsyncStorage.getItem("userUID");
    if (savedUID) {
      await loadUserProfile(savedUID);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // 🔹 Check permissions (location, camera, audio, gallery)
  const checkPermissions = async () => {
    const { status: locationStatus } =
      await Location.getForegroundPermissionsAsync();
    const { status: cameraStatus } = await Camera.getCameraPermissionsAsync();
    const { status: audioStatus } = await Camera.getMicrophonePermissionsAsync();
    const { status: galleryStatus } = await MediaLibrary.getPermissionsAsync();

    const all = {
      location: locationStatus === "granted",
      camera: cameraStatus === "granted",
      audio: audioStatus === "granted",
      gallery: galleryStatus === "granted",
    };

    const allGranted = Object.values(all).every(Boolean);
    await AsyncStorage.setItem(
      "permissionsGranted",
      allGranted ? "true" : "false"
    );

    return allGranted;
  };

  // 🔹 Handle user flow after auth + permissions
  useEffect(() => {
    const handleFlow = async () => {
      if (authLoading) return;

      if (!user) {
        router.replace("/(auth)/sign-in");
        return;
      }

      const permissionsGranted = await checkPermissions();
      if (permissionsGranted) {
        router.replace("/home");
      } else {
        router.replace("/(settings)/permissions");
      }
    };

    handleFlow();
  }, [authLoading, user]);

  // 🔹 Show loading screen while initializing
  if (authLoading) {
    return (
      <LinearGradient
        colors={["#1B1B1B", "#2A2A2A", "#3A3A3A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 justify-center items-center px-5"
      >
        <ActivityIndicator size="large" color="#E60023" />
      </LinearGradient>
    );
  }

  // 🔹 Temporary fallback UI (won’t be visible long)
  return (
    <SafeAreaView className="flex-1 bg-black items-center justify-center">
      <Image source={logo} style={{ width: 120, height: 120, marginBottom: 50 }} />
      <Text className="text-white text-xl font-semibold">
        Loading ResQall...
      </Text>
      <ActivityIndicator size="large" color="#E60023" style={{ marginTop: 10 }} />
    </SafeAreaView>
  );
}
