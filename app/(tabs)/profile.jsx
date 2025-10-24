import { AntDesign, Entypo, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, deleteAccount, logout, changePassword } = useAuth();

  const handleDeleteAccount = async () => {
    const result = await deleteAccount();
    if (result.isDeleted) {
      Alert.alert("Account Deleted Successfully!");
    } else {
      Alert.alert("Error Deleting Account", result?.message);
    }
  };

  const handleDeleteAccountConfirmation = async () => {
    Alert.alert(
      "Permanently Delete Your Account",
      "Are you sure you want to delete your account?",
      [
        { text: "No", style: "cancel", isPreferred: false },
        {
          text: "Yes",
          style: "default",
          isPreferred: true,
          onPress: handleDeleteAccount,
        },
      ],
      { cancelable: true }
    );
  };

  const handleChangePassword = async () => {
    await changePassword();
    Alert.alert(
      "Password Reset",
      "A link has been sent to your registered email for resetting password!"
    );
  };

  return (
    <SafeAreaView className="bg-black">
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#1B1B1B", "#2A2A2A", "#3A3A3A"]} // Dark Professional Gradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 justify-center items-center px-5"
        >
          {/* Header */}
          <Text className="text-3xl font-extrabold text-white m-auto underline underline-offset-8 mt-12">
            USER PROFILE
          </Text>

          <View style={{ height: "100%" }} className="flex gap-2">
            {/* USER DETAILS */}
            <View className="m-4 mb-1 p-5 flex flex-row items-center justify-around gap-1">
              <Ionicons
                className="m-3 p-3 bg-[#E60023] rounded-full"
                name="person"
                size={32}
                color="white"
              />
              <View>
                <Text className="text-xl font-medium max-w-52 text-wrap text-white">
                  {user?.name}
                </Text>
                <Text className="text-base font-normal max-w-60 text-gray-300">
                  {user?.email}
                </Text>
              </View>
            </View>

            {/* BORDER LINE */}
            <View className="flex items-center">
              <View className="w-11/12 -mt-5 border-b-2 border-gray-300" />
            </View>

            {/* OPTIONS */}
            <View className="bg-[#1E1E1E] m-5 rounded-xl shadow-md border border-gray-700">
              <TouchableOpacity
                onPress={() => router.push("/(settings)/contacts")}
                className="m-2 p-3 mb-0 flex flex-row gap-4 items-center border-b border-gray-700"
              >
                <AntDesign name="contacts" size={26} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Edit Contacts</Text>
                <AntDesign className="ml-auto" name="right" size={22} color="#E0E0E0" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(settings)/emergency-code")}
                className="m-2 p-3 mb-0 flex flex-row gap-4 items-center border-b border-gray-700"
              >
                <AntDesign name="edit" size={26} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Modify Emergency Code</Text>
                <AntDesign className="ml-auto" name="right" size={22} color="#E0E0E0" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(settings)/permissions")}
                className="m-2 p-3 mb-0 flex flex-row gap-4 items-center border-b border-gray-700"
              >
                <Ionicons name="lock-open" size={26} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Permissions</Text>
                <AntDesign className="ml-auto" name="right" size={22} color="#E0E0E0" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleChangePassword}
                className="m-2 p-3 flex flex-row gap-4 items-center border-b border-gray-700"
              >
                <Entypo name="key" size={26} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Change Password</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={logout}
                className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center"
              >
                <FontAwesome name="sign-out" size={26} color="#E60023" />
                <Text className="text-[#E60023] font-medium">Sign Out</Text>
              </TouchableOpacity>
            </View>

            {/* OTHER OPTIONS */}
            <Text className="m-5 mb-0 text-white text-lg font-bold">
              OTHER DETAILS
            </Text>
            <View className="bg-[#1E1E1E] m-5 mt-0 rounded-xl shadow-md border border-gray-700">
              <TouchableOpacity className="m-2 p-3 flex flex-row gap-4 items-center border-b border-gray-700">
                <AntDesign name="infocirlceo" size={24} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Version</Text>
                <Text className="ml-auto text-gray-400">v1.0.0</Text>
              </TouchableOpacity>

              <TouchableOpacity className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center border-b border-gray-700">
                <Ionicons name="globe-outline" size={24} color="#E0E0E0" />
                <Text className="text-base text-gray-100">Language</Text>
                <Text className="ml-auto text-gray-400">English</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteAccountConfirmation}
                className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center"
              >
                <FontAwesome name="remove" size={26} color="#E60023" />
                <Text className="text-[#E60023] font-medium">Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
