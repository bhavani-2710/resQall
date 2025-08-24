import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import logo from "../../assets/images/logo.png";
import { useAuth } from "../../context/AuthContext";

const SignIn = () => {
  const { login } = useAuth();
  const router = useRouter();

  const handleSignIn = async (values) => {
    try {
      const { email, password } = values;
      if (!email || !password) {
        Alert.alert("Error", "Please fill in all fields");
        return;
      }
      login(email, password);
    } catch (error) {
      console.error(error);
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-black flex-1">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="m-2 flex-1 justify-center items-center">
            <Image source={logo} style={{ height: 100, width: 100 }} />
            <Text className="text-lg text-center text-white font-bold m-10">
              Welcome Back!
            </Text>
            <View className="w-5/6">
              <Formik
                initialValues={{ email: "", password: "" }}
                onSubmit={handleSignIn}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  touched,
                  errors,
                }) => (
                  <View className="w-full">
                    <TextInput
                      className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                      placeholder="Email"
                      placeholderTextColor="#9ca3af"
                      keyboardType="email-address"
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                      value={values.email}
                    />
                    {touched.email && errors.email && (
                      <Text className="text-red-500 text-xs mb-2">
                        {errors.email}
                      </Text>
                    )}

                    <TextInput
                      className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                      placeholder="Password"
                      placeholderTextColor="#9ca3af"
                      secureTextEntry
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                      value={values.password}
                    />
                    {touched.password && errors.password && (
                      <Text className="text-red-500 text-xs mb-2">
                        {errors.password}
                      </Text>
                    )}

                    <TouchableOpacity
                      onPress={() => handleSubmit()}
                      className="p-3 mt-10 bg-[#CF0F47] rounded-lg"
                    >
                      <Text className="text-xl font-semibold text-center text-white">
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </Formik>
            </View>
            <View>
              <Text className="text-center text-lg font-semibold my-4 text-white">
                <View className="border-b-2 border-[#CF0F47] p-2 mb-1 w-24" />
                {"   "}or{"  "}{" "}
                <View className="border-b-2 border-[#CF0F47] p-2 mb-1 w-24" />
              </Text>
              <TouchableOpacity
                className="flex flex-row items-center justify-center"
                onPress={() => router.push("/sign-up")}
              >
                <Text className="text-white font-semibold">
                  Not a user yet?{" "}
                </Text>
                <Text className="text-base font-semibold underline text-[#CF0F47]">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignIn;
