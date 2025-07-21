import { useRouter } from "expo-router";
import {
  Image,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from '../assets/images/logo.png';

export default function Index() {
  const router = useRouter();
  return (
    <SafeAreaView className={`bg-[#000000]`}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          <View className="mt-36 mb-20">
            <Image source={logo} style={{ height: 200, width: 200 }} />
          </View>
          <View className="w-3/4">
            <TouchableOpacity
              onPress={() => router.push("/sign-up")}
              className="p-2 my-2 bg-[#CF0F47] text-black rounded-lg"
            >
              <Text className="text-lg font-semibold text-center">Sign Up</Text>
            </TouchableOpacity>

            {/* Home & Emergency - temporary */}
            <TouchableOpacity
              onPress={() => router.push("/home")}
              className="p-2 my-2 bg-[#000000] border border-[#CF0F47] rounded-lg max-w-fit"
            >
              <Text className="text-lg font-semibold text-[#CF0F47] text-center">
                Home
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/emergency")}
              className="p-2 my-2 bg-[#000000] border border-[#CF0F47] rounded-lg max-w-fit"
            >
              <Text className="text-lg font-semibold text-[#CF0F47] text-center">
                Emergency
              </Text>
            </TouchableOpacity>

          </View>
          <View>
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
          </View>
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
  );
}
