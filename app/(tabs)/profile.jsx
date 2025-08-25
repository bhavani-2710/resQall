import { AntDesign, FontAwesome, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  Alert,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen() {
  const router = useRouter();
  const {
    user,
    updateEmergencyDetails,
    handleDeleteAccount,
    logout,
    changePassword,
  } = useAuth();

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
      {
        cancelable: true,
      }
    );
  };

  const handleChangePassword = async () => {
    await changePassword();
    Alert.alert(
      "Password Reset",
      "A Link has been sent to your registered email for resetting password!"
    );
  };

  return (
    <SafeAreaView className="bg-[#FFDEDE] pt-12">
      {/* Header */}
      <Text className="text-3xl font-extrabold text-[#28282B] m-auto underline underline-offset-8 mt-6">
        USER PROFILE
      </Text>

      <View
        style={{
          height: "100%",
          backgroundColor: "#FFDEDE",
        }}
        className="flex gap-2"
      >
        {/* USER DETAILS */}
        <View className="m-4 mb-1 p-5 flex flex-row items-center justify-around gap-1">
          <Ionicons
            className="m-3 p-3 border border-white bg-[#28282B] rounded-full"
            name="person"
            size={32}
            color="white"
          />

          <View>
            <Text className="text-xl font-medium max-w-52 text-wrap text-[#28282B]">
              {user?.name}
            </Text>
            <Text className="text-base font-normal max-w-60 text-wrap text-[#28282B]">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* BORDER LINE*/}
        <View className="flex items-center">
          <View className="w-11/12 -mt-5 border-b-2 border-[#28282B]" />
        </View>

        {/* OPTIONS */}
        <View
          contentContainerStyle={{ display: "flex" }}
          className="bg-white m-5 rounded-lg border border-[#28282B]"
        >
          <TouchableOpacity
            onPress={() => router.push("/(settings)/contacts")}
            className="m-2 p-3 mb-0 flex flex-row gap-4 items-center border-b border-[#CF0F47]"
          >
            <AntDesign name="contacts" size={28} color="black" />
            <Text className="text-base">Edit Contacts</Text>
            <AntDesign
              className="ml-auto"
              name="right"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(settings)/emergency-code")}
            className="m-2 p-3 mb-0 flex flex-row gap-4 items-center border-b border-[#CF0F47]"
          >
            <AntDesign name="edit" size={28} color="black" />
            <Text className="text-base">Modify Emergency Code</Text>
            <AntDesign
              className="ml-auto"
              name="right"
              size={24}
              color="black"
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleChangePassword}
            className="m-2 p-3 flex flex-row gap-4 items-center border-b border-[#CF0F47]"
          >
            <Ionicons name="lock-open" size={28} color="black" />
            <Text className="text-base">Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={logout}
            className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center"
          >
            <FontAwesome name="sign-out" size={28} color="#C41E3A" />
            <Text className="text-[#C41E3A]">Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* OTHER OPTIONS */}
        <Text className="m-5 mb-0 text-[#28282B] text-lg font-bold">OTHER</Text>
        <View
          contentContainerStyle={{ display: "flex" }}
          className="bg-white m-5 mt-0 rounded-lg border border-[#28282B]"
        >
          <TouchableOpacity className="m-2 p-3 flex flex-row gap-4 items-center border-b border-[#CF0F47]">
            <AntDesign name="infocirlceo" size={24} color="black" />
            <Text className="text-base">Version</Text>
            <Text className="ml-auto text-gray-500">v1.0.0</Text>
          </TouchableOpacity>
          <TouchableOpacity className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center border-b border-[#CF0F47]">
            <Ionicons name="globe-outline" size={24} color="black" />
            <Text className="text-base">Language</Text>
            <Text className="ml-auto text-gray-500">English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDeleteAccountConfirmation}
            className="-mt-2 m-2 p-3 flex flex-row gap-4 items-center"
          >
            <FontAwesome name="remove" size={28} color="#C41E3A" />
            <Text className="text-[#C41E3A]">Delete Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
