import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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
    <LinearGradient
      colors={["#2E2E33", "#1E1E20"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 justify-center items-center px-6 py-10">
              {/* Logo */}
              <Image
                source={logo}
                style={{ height: 100, width: 100, marginBottom: 25 }}
                resizeMode="contain"
              />

              {/* Title */}
              <Text className="text-2xl font-semibold text-[#F5F5F5] mb-10">
                Welcome Back!
              </Text>

              {/* Form */}
              <View className="w-full">
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
                      {/* Email Input */}
                      <TextInput
                        className="my-3 h-12 border border-gray-400/60 bg-[#2E2E2E] text-[#F5F5F5] text-base rounded-xl px-4"
                        placeholder="Email"
                        placeholderTextColor="#9EA0A4"
                        keyboardType="email-address"
                        onChangeText={handleChange("email")}
                        onBlur={handleBlur("email")}
                        value={values.email}
                      />
                      {touched.email && errors.email && (
                        <Text className="text-[#FF3B3B] text-xs mb-1">
                          {errors.email}
                        </Text>
                      )}

                      {/* Password Input */}
                      <TextInput
                        className="my-3 h-12 border border-gray-400/60 bg-[#2E2E2E] text-[#F5F5F5] text-base rounded-xl px-4"
                        placeholder="Password"
                        placeholderTextColor="#9EA0A4"
                        secureTextEntry
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        value={values.password}
                      />
                      {touched.password && errors.password && (
                        <Text className="text-[#FF3B3B] text-xs mb-1">
                          {errors.password}
                        </Text>
                      )}

                      {/* Sign In Button */}
                      <TouchableOpacity
                        onPress={() => handleSubmit()}
                        activeOpacity={0.8}
                        style={{
                          borderRadius: 12,
                          marginTop: 30,
                          overflow: "hidden",
                        }}
                      >
                        <LinearGradient
                          colors={["#D7263D", "#FF4C60"]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={{
                            paddingVertical: 14,
                            alignItems: "center",
                            borderRadius: 12,
                          }}
                        >
                          <Text className="text-white text-lg font-semibold">
                            Sign In
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              </View>

              {/* Divider */}
              <View className="flex-row items-center justify-center my-8 w-full">
                <View className="flex-1 h-[1px] bg-[#2E2E2E]" />
                <Text className="mx-3 text-[#9EA0A4]">or</Text>
                <View className="flex-1 h-[1px] bg-[#2E2E2E]" />
              </View>

              {/* Sign Up Link */}
              <TouchableOpacity
                className="flex-row items-center justify-center"
                onPress={() => router.push("/sign-up")}
              >
                <Text className="text-[#F5F5F5] font-medium text-base">
                  Not a user yet?{" "}
                </Text>
                <Text className="text-[#FF4C60] font-semibold underline text-base">
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignIn;
