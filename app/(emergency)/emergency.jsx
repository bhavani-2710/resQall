import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  SafeAreaView,
  Text,
  View,
  ActivityIndicator,
  Vibration,
  Alert,
} from "react-native";
import { useAuth } from "@/context/AuthContext";

import { recordAudio } from "@/services/audioService";
import { takePhoto } from "@/services/cameraService";
import { getLocation } from "@/services/locationService";
import { loadEmergencyContacts, saveSOS } from "@/services/emergencyService";
import { RecordingPresets, useAudioRecorder } from "expo-audio";

export default function Emergency() {
  const router = useRouter();
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const pulseAnimation = useRef(new Animated.Value(1)).current;

  const { user } = useAuth();

  const [steps, setSteps] = useState([
    {
      id: "location",
      label: "Getting Location",
      status: "pending",
      progress: 0,
    },
    { id: "photo", label: "Taking Photo", status: "pending", progress: 0 },
    { id: "audio", label: "Recording Audio", status: "pending", progress: 0 },
    { id: "sos", label: "Sending SOS", status: "pending", progress: 0 },
  ]);

  const [currentStep, setCurrentStep] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ----------------- Pulse animation -----------------
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimation, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ----------------- Helpers -----------------
  const updateStepStatus = (stepId, status, progress = 0) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, status, progress } : s))
    );
    const completedSteps = steps.filter((s) => s.status === "completed").length;
    const newProgress = (completedSteps / steps.length) * 100;
    setOverallProgress(newProgress);
    Animated.timing(progressAnimation, {
      toValue: newProgress,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const simulateProgress = (stepId, duration = 3000) =>
    new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        updateStepStatus(stepId, "processing", progress);
        if (progress >= 100) {
          clearInterval(interval);
          resolve();
        }
      }, duration / 10);
    });

  // ----------------- Process Emergency -----------------
  const processEmergency = async () => {
    try {
      Vibration.vibrate([100, 50, 100]);

      // ----------------- Camera Permission -----------------
      if (!permission?.granted) {
        const { granted } = await requestPermission();
        if (!granted) throw new Error("Camera permission required");
      }

      // ----------------- Load Contacts -----------------
      await loadEmergencyContacts(user);

      // ----------------- Step 1: Location -----------------
      setCurrentStep(0);
      updateStepStatus("location", "processing");
      const location = await getLocation();
      await simulateProgress("location", 2000);
      updateStepStatus("location", "completed", 100);

      // ----------------- Step 2: Photo -----------------
      setCurrentStep(1);
      updateStepStatus("photo", "processing");
      const photoUri = await takePhoto(cameraRef);
      await simulateProgress("photo", 2500);
      updateStepStatus("photo", "completed", 100);

      // ----------------- Step 3: Audio -----------------
      setCurrentStep(2);
      updateStepStatus("audio", "processing");

      const audioUri = await recordAudio(audioRecorder, 30000);
      updateStepStatus("audio", "completed", 100);

      // ----------------- Step 4: Send SOS -----------------
      setCurrentStep(3);
      updateStepStatus("sos", "processing");
      await saveSOS(user, { photoUri, audioUri, location });
      await simulateProgress("sos", 2000);
      updateStepStatus("sos", "completed", 100);

      // ----------------- Completed -----------------
      setIsCompleted(true);
      setOverallProgress(100);
      Vibration.vibrate([200, 100, 200]);

      // Auto-navigate back after 5 seconds
      setTimeout(() => router.back(), 5000);
    } catch (err) {
      console.error("Emergency processing failed:", err);
      setHasError(true);
      setErrorMessage(err.message || "An error occurred");

      const currentStepId = steps[currentStep]?.id;
      if (currentStepId) updateStepStatus(currentStepId, "failed", 0);

      Vibration.vibrate([500, 200, 500]);
      Alert.alert("Emergency Error", err.message || "An error occurred", [
        { text: "Retry", onPress: processEmergency },
        { text: "Cancel", onPress: () => router.back() },
      ]);
    }
  };

  useEffect(() => {
    processEmergency();
  }, []);

  const getStepIcon = (step) => {
    switch (step.status) {
      case "completed":
        return <Ionicons name="checkmark-circle" size={28} color="#22c55e" />;
      case "failed":
        return <Ionicons name="close-circle" size={28} color="#ef4444" />;
      case "processing":
        return <ActivityIndicator size="small" color="#eab308" />;
      default:
        return <Ionicons name="ellipse-outline" size={28} color="#6b7280" />;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 6,
        }}
      >
        <View className="w-full max-w-md bg-gray-100 rounded-xl p-6 shadow-md mt-10">
          <View className="items-center mb-4">
            <Ionicons name="warning" size={48} color="#FF6347" />
            <Text className="text-2xl font-bold text-red-500 mt-2">
              Emergency Mode
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              Processing your emergency alert...
            </Text>
          </View>

          <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-2 mb-2">
            <Animated.View
              className="h-2 bg-red-500 rounded-full"
              style={{
                width: progressAnimation.interpolate({
                  inputRange: [0, 100],
                  outputRange: ["0%", "100%"],
                }),
              }}
            />
          </View>
          <Text className="text-right text-red-500 font-bold mt-1">
            {Math.round(overallProgress)}%
          </Text>

          <View className="mt-6 space-y-2">
            {steps.map((step, idx) => (
              <View
                key={step.id}
                className={`flex-row items-center py-2 border-b ${
                  currentStep === idx
                    ? "bg-red-100 rounded-lg"
                    : "border-gray-200"
                }`}
              >
                {getStepIcon(step)}
                <Text
                  className={`ml-4 flex-1 ${
                    currentStep === idx
                      ? "text-red-500 font-bold"
                      : "text-gray-700"
                  }`}
                >
                  {step.label}
                </Text>
                <Text className="text-gray-500 capitalize">{step.status}</Text>
              </View>
            ))}
          </View>

          {isCompleted && (
            <View className="mt-6 items-center bg-green-100 rounded-lg p-4">
              <Ionicons name="checkmark-circle" size={32} color="#22c55e" />
              <Text className="text-green-600 font-bold mt-2 text-lg">
                Alert Sent Successfully!
              </Text>
            </View>
          )}

          {hasError && (
            <View className="mt-6 items-center bg-red-100 rounded-lg p-4">
              <Ionicons name="alert-circle" size={32} color="#ef4444" />
              <Text className="text-red-600 font-bold mt-2 text-center">
                {errorMessage}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {permission?.granted && (
        <CameraView
          ref={cameraRef}
          className="absolute w-1 h-1 left-[-1000px] top-[-1000px]"
          facing="back"
        />
      )}
    </SafeAreaView>
  );
}
