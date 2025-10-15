import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";


export default function HomeScreen() {
  const router = useRouter();

  const handleSOS = () => {
    router.push("/emergency");
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#DC2626] px-5">
      <Text className="text-3xl font-bold text-[#ffffff] mb-2">
        Emergency SOS
      </Text>
      <Text className="text-base text-[#f5f5f5] opacity-70 text-center mb-16">
        Press the button in case of an emergency
      </Text>

      <TouchableOpacity
        onPress={handleSOS}
        activeOpacity={0.85}
        className="w-44 h-44 rounded-full justify-center items-center shadow-2xl"
        style={{ backgroundColor: "#FF0B55", shadowColor: "#E6004C" }}
      >
        <FontAwesome5 name="exclamation-circle" size={60} color="#fff" />
        <Text className="text-white text-4xl font-bold mt-2 tracking-widest">
          SOS
        </Text>
      </TouchableOpacity>
    </View>
  );
}
