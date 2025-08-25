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

const EmergencyCodeSettings = () => {
  const router = useRouter();
  const { user, updateEmergencyCode } = useAuth();
  const [emergencyCode, setEmergencyCode] = useState("");

  const handleProceed = async () => {
    if (!emergencyCode.trim()) {
      Alert.alert("Emergency code is required.");
      return;
    }
    // Save code
    await updateEmergencyCode(user.uid, emergencyCode.trim());
    setEmergencyCode("");
  };

  return (
    <SafeAreaView className="bg-[#FFDEDE] flex-1 px-5 pt-12">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
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
            <Text className="flex text-3xl font-extrabold text-[#28282B] my-5">
              Edit Emergency Code
            </Text>


          <Text className="text-xl font-bold text-[#CF0F47] my-2">
            Emergency Code
          </Text>
          <View className="border border-[#28282B] text-[#28282B] rounded-lg p-3 mb-6 bg-gray-200">
            <Text className="text-[#28282B] font-medium text-lg">
              {user.emergencyCode || "No saved Emergency Code"}
            </Text>
          </View>
          <Text className="text-xl font-bold text-[#CF0F47] mb-2">
            New Emergency Code
          </Text>
          <TextInput
            className="border border-[#28282B] text-[#28282B] rounded-lg p-3 mb-6 bg-white font-medium text-lg"
            placeholder="Enter your new emergency code"
            placeholderTextColor="#797979"
            value={emergencyCode}
            onChangeText={setEmergencyCode}
          />

          {/* Proceed Button */}
          <TouchableOpacity
            onPress={handleProceed}
            className="p-3 bg-[#CF0F47] rounded-lg"
          >
            <Text className="text-xl font-semibold text-center text-white">
              Save Changes
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EmergencyCodeSettings;
