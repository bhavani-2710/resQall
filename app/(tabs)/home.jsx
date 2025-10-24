import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome5 } from "@expo/vector-icons";
import useWakeWord from "../../hooks/useWakeWord";

export default function HomeScreen() {
  const router = useRouter();

  useWakeWord(); // starts background wake word listener

  const handleSOS = () => {
    router.push("/emergency");
  };

  return (
    <LinearGradient
      colors={["#fff0f0", "#ffffff"]} // soft warm background
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1 justify-center items-center px-5"
    >
      {/* Header */}
      <View className="items-center mb-16">
        <Text className="text-5xl font-extrabold text-[#000000] mb-5">
          ResQall
        </Text>
        <Text className="text-4xl font-extrabold text-[#E60023] mb-2">
          🚨 Emergency SOS 🚨
        </Text>
        <Text className="mt-3 text-base text-[#333] text-center max-w-xs opacity-80">
          Press the button immediately if you;&apos;re in danger or need urgent
          help
        </Text>
      </View>

      {/* Button */}
      <TouchableOpacity
        onPress={handleSOS}
        activeOpacity={0.8}
        className="w-48 h-48 rounded-full justify-center items-center"
        style={{
          backgroundColor: "#E60023", // dark red for contrast
          shadowColor: "#B00020",
          shadowOpacity: 0.6,
          shadowOffset: { width: 0, height: 10 },
          shadowRadius: 25,
          elevation: 10,
        }}
      >
        <FontAwesome5 name="exclamation-triangle" size={55} color="#fff" />
        <Text className="text-white text-5xl font-extrabold mt-2 tracking-widest">
          SOS
        </Text>
      </TouchableOpacity>

      {/* Note */}
      <Text className="text-[#333] opacity-70 text-base mt-16 text-center px-2">
        Stay calm. Your location and emergency message will be sent to your
        trusted contacts.
      </Text>
    </LinearGradient>
  );
}
