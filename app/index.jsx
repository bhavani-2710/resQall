import { useAuth } from "@/context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import * as Location from "expo-location";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../assets/images/logo.png";

export default function Index() {
  const router = useRouter();
  const { user, isLoggedIn, authLoading, loadUserProfile } = useAuth();

  const fetchUser = async () => {
    const savedUID = await AsyncStorage.getItem("userUID");
    if (savedUID) {
      await loadUserProfile(savedUID);
    }
  };

  // Check permissions and store result in AsyncStorage
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

    const allGranted = Object.values(all).every(Boolean);
    await AsyncStorage.setItem(
      "permissionsGranted",
      allGranted ? "true" : "false"
    );

    return allGranted;
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    const handleFlow = async () => {
      if (!user) return;

      if (!user.emailVerified) {
        router.replace("/sign-in");
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
  }, [user]);

  if (authLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-[#28282B]">
        <ActivityIndicator size="large" color="#CF0F47" />
      </SafeAreaView>
    );
  }
  return !user ? (
    <SafeAreaView className={`bg-[#28282B]`}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          <View className="mt-36 mb-20">
            <Image source={logo} style={{ height: 200, width: 200 }} />
          </View>
          <View className="w-3/4">
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              className="p-2 my-2 bg-[#CF0F47] rounded-lg"
            >
              <Text className="text-lg font-semibold text-[#28282B] text-center">
                Sign Up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              className="p-2 my-2 bg-[#28282B] border border-[#CF0F47] rounded-lg"
            >
              <Text className="text-lg font-semibold  text-[#CF0F47] text-center">
                Sign In
              </Text>
            </TouchableOpacity>

            {/* Home & Emergency - temporary */}
            {/* <TouchableOpacity
              onPress={() => router.push("/home")}
              className="p-2 my-2 bg-[#000000] border border-[#CF0F47] rounded-lg max-w-fit"
            >
              <Text className="text-lg font-semibold text-[#CF0F47] text-center">
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(settings)/contacts")}
              className="p-2 my-2 bg-[#000000] border border-[#CF0F47] rounded-lg max-w-fit"
            >
              <Text className="text-lg font-semibold text-[#CF0F47] text-center">
                Settings-contacts
              </Text>
            </TouchableOpacity> */}
          </View>
          {/* <View>
            <Text className="text-center text-lg font-semibold my-4 text-white">
              <View className="border-b-2 border-[#CF0F47] p-2 mb-1 w-24" />
              {"   "}or{"  "}{" "}
              <View className="border-b-2 border-[#CF0F47] p-2 mb-1 w-24" />
            </Text>

            <TouchableOpacity
              className="flex flex-row items-center justify-center"
              onPress={() => router.push("/sign-in")}
            >
              <Text className="text-white font-semibold">Already a User? </Text>
              <Text className="text-base font-semibold underline text-[#CF0F47]">
                Sign In
              </Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* IMAGE */}
        <View className="flex-1">
          {/* <Image
            source={entryImage}
            className="w-full h-full"
            resizeMode="contain"
          /> */}
        </View>
        <StatusBar barStyle={"light-content"} backgroundColor={"#000000"} />
      </ScrollView>
    </SafeAreaView>
  ) : null;
}
