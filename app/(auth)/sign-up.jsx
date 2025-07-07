import { useRouter } from "expo-router";
import { Formik } from "formik";
import {
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import userValidationSchema from "../../utils/authSchema";

const SignUp = () => {
  const router = useRouter();

  const handleSignup = () => {};

  return (
    <SafeAreaView className={`bg-[#000000]`}>
      <ScrollView contentContainerStyle={{ height: "100%" }}>
        <View className="m-2 flex justify-center items-center">
          {/* <Image source={logo} style={{ height: 300, width: 300 }} /> */}
          <Text className="text-lg text-center text-white font-bold mb-10 mt-[-60]">
            Let's get you started!
          </Text>

          <View className="w-5/6">
            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={userValidationSchema}
              onSubmit={handleSignup}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View className="w-full">
                  <TextInput
                    className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    value={values.name}
                    placeholder="Name"
                    placeholderTextColor="white"
                  />
                  {touched.name && errors.name && (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.name}
                    </Text>
                  )}

                  <TextInput
                    className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                    keyboardType="email-address"
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    value={values.email}
                    placeholder="Email"
                    placeholderTextColor="white"
                  />
                  {touched.email && errors.email && (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.email}
                    </Text>
                  )}

                  <TextInput
                    className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                    secureTextEntry={true}
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                    value={values.password}
                    placeholder="Password"
                    placeholderTextColor="white"
                  />
                  {touched.password && errors.password && (
                    <Text className="text-red-500 text-xs mb-2">
                      {errors.password}
                    </Text>
                  )}

                  <TouchableOpacity
                    onPress={handleSubmit}
                    className="p-3 my-10 bg-[#CF0F47] text-black rounded-lg"
                  >
                    <Text className="text-xl ont-semibold text-center">
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>

            <View>
            <Text className="text-center text-lg font-semibold mt-[-15] mb-4 text-white">
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
        </View>

        {/* IMAGE */}
        {/* <View className="flex-1">
          <Image
            source={entryImage}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View> */}
        <StatusBar barStyle={"light-content"} backgroundColor={"#000000"} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
