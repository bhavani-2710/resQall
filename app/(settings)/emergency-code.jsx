import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const EmergencyCodeSettings = () => {
  const router = useRouter();
  const { user, updateEmergencyCode } = useAuth();
  const [emergencyCode, setEmergencyCode] = useState("");

  const handleProceed = async () => {
    if (!emergencyCode.trim()) {
      Alert.alert("Emergency code is required.");
      return;
    }
    await updateEmergencyCode(user.uid, emergencyCode.trim());
    setEmergencyCode("");
    Alert.alert("Emergency code updated successfully!");
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
          <ScrollView
            contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
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
              Edit Emergency Code
            </Text>

            {/* Current Emergency Code */}
            <Text className="text-xl font-bold text-[#E0E0E0] mb-2">
              Current Emergency Code
            </Text>
            <View className="border border-gray-600 rounded-lg p-3 mb-6 bg-[#2A2A2A]">
              <Text className="text-white font-medium text-lg">
                {user.emergencyCode || "No saved Emergency Code"}
              </Text>
            </View>

            {/* New Emergency Code */}
            <Text className="text-xl font-bold text-[#E0E0E0] mb-2">
              New Emergency Code
            </Text>
            <TextInput
              className="border border-gray-600 rounded-lg p-3 mb-6 bg-[#1E1E1E] text-white font-medium text-lg"
              placeholder="Enter your new emergency code"
              placeholderTextColor="#797979"
              value={emergencyCode}
              onChangeText={setEmergencyCode}
            />

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleProceed}
              className="p-3 bg-[#E60023] rounded-lg"
            >
              <Text className="text-xl font-semibold text-center text-white">
                Save Changes
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default EmergencyCodeSettings;
