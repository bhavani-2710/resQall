import AntDesign from "@expo/vector-icons/AntDesign";
import * as Contacts from "expo-contacts";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Formik } from "formik";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
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
import { userValidationSchema } from "../../utils/authSchema";

const SignUp = () => {
  const { signup } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    contacts: [{ name: "", phone: "", email: "" }],
    emergencyCode: "",
  });

  const [contactPermissionStatus, setContactPermissionStatus] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [targetIndex, setTargetIndex] = useState(null);

  const handleSignupBasic = async (values) => {
    try {
      setUserData({ ...userData, ...values });
      setCurrentStep(2);
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      signup(userData);
      Alert.alert("Signup Complete!");
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  const openContactsPicker = async (index) => {
    if (contactPermissionStatus) {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        sort: "firstName",
      });

      if (data.length > 0) {
        const filtered = data.filter((c) => c.phoneNumbers?.length > 0);
        setAvailableContacts(filtered);
        setTargetIndex(index);
        setContactSearch("");
        setContactsModalVisible(true);
      } else {
        Alert.alert("No contacts found.");
      }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied to access contacts.");
        return;
      }
      setContactPermissionStatus(true);
    })();
  }, []);

  const filteredContacts = availableContacts.filter((item) =>
    item.name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <LinearGradient
      colors={["#2E2E33", "#1E1E20"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="m-4 flex-1 justify-center items-center">
              <Image source={logo} style={{ height: 100, width: 100 }} />
              <Text className="text-xl text-center text-white font-bold my-8">
                Let’s get you started!
              </Text>

              <View className="w-5/6 bg-[#33333A]/40 rounded-2xl p-5 shadow-lg">
                {/* STEP 1 */}
                {currentStep === 1 && (
                  <Formik
                    initialValues={{ name: "", email: "", password: "" }}
                    validationSchema={userValidationSchema}
                    onSubmit={handleSignupBasic}
                  >
                    {({
                      handleChange,
                      handleBlur,
                      handleSubmit,
                      values,
                      errors,
                      touched,
                    }) => (
                      <View>
                        {["name", "email", "password"].map((field, i) => (
                          <View key={i}>
                            <TextInput
                              className="my-3 h-12 border border-gray-400/60 text-white text-lg rounded-lg px-3 bg-[#1F1F22]/60"
                              secureTextEntry={field === "password"}
                              keyboardType={
                                field === "email" ? "email-address" : "default"
                              }
                              onChangeText={handleChange(field)}
                              onBlur={handleBlur(field)}
                              value={values[field]}
                              placeholder={
                                field === "name"
                                  ? "Full Name"
                                  : field === "email"
                                    ? "Email Address"
                                    : "Password"
                              }
                              placeholderTextColor="#9ca3af"
                            />
                            {touched[field] && errors[field] && (
                              <Text className="text-red-400 text-xs mb-2">
                                {errors[field]}
                              </Text>
                            )}
                          </View>
                        ))}

                        <TouchableOpacity
                          onPress={handleSubmit}
                          className="p-3 my-8 bg-[#CF0F47] rounded-lg shadow-md"
                        >
                          <Text className="text-xl font-semibold text-center text-white">
                            Next: Emergency Contacts
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </Formik>
                )}

                {/* STEP 2 */}
                {currentStep === 2 && (
                  <View>
                    <Text className="text-xl text-white font-bold mb-5">
                      Emergency Contacts
                    </Text>

                    {userData.contacts.map((contact, index) => (
                      <View
                        key={index}
                        className="mb-6 border border-gray-400/70 bg-[#1F1F22]/60 rounded-xl p-4"
                      >
                        <View className="flex flex-row justify-between items-center mb-2">
                          <Text className="text-white font-semibold">
                            Contact-{index + 1}
                          </Text>
                          {index > 0 && (
                            <TouchableOpacity
                              onPress={() => {
                                const updated = [...userData.contacts];
                                updated.splice(index, 1);
                                setUserData({ ...userData, contacts: updated });
                              }}
                            >
                              <Text className="text-red-400">Remove</Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {["name", "phone", "email"].map((field, i) => (
                          <TextInput
                            key={i}
                            className="mb-2 border border-gray-500 text-white rounded-lg px-3 py-2"
                            placeholder={
                              field === "name"
                                ? "Name"
                                : field === "phone"
                                  ? "Phone"
                                  : "Email"
                            }
                            placeholderTextColor="#9ca3af"
                            value={contact[field]}
                            onChangeText={(text) => {
                              const updated = [...userData.contacts];
                              updated[index][field] = text;
                              setUserData({ ...userData, contacts: updated });
                            }}
                          />
                        ))}

                        <TouchableOpacity
                          onPress={() => openContactsPicker(index)}
                          className="mt-3 bg-white px-3 py-2 rounded-lg"
                        >
                          <Text className="text-[#28282B] text-center font-semibold">
                            Pick from Contacts
                          </Text>
                        </TouchableOpacity>
                      </View>
                    ))}

                    {userData.contacts.length < 5 && (
                      <TouchableOpacity
                        onPress={() => {
                          setUserData({
                            ...userData,
                            contacts: [
                              ...userData.contacts,
                              { name: "", phone: "", email: "" },
                            ],
                          });
                        }}
                        className="p-3 bg-[#CF0F47] rounded-lg mb-4"
                      >
                        <View className="flex flex-row justify-center gap-2">
                          <AntDesign
                            name="pluscircle"
                            size={16}
                            color="white"
                          />
                          <Text className="text-white text-center font-medium text-sm">
                            Add Another Contact
                          </Text>
                        </View>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      onPress={() => {
                        const firstContact = userData.contacts[0];
                        if (
                          !firstContact.name.trim() ||
                          !firstContact.phone.trim() ||
                          !firstContact.email.trim()
                        ) {
                          Alert.alert("At least 1 contact required.");
                        } else {
                          setCurrentStep(3);
                        }
                      }}
                      className="p-3 bg-[#CF0F47] rounded-lg shadow-md"
                    >
                      <Text className="text-xl font-semibold text-center text-white">
                        Next: Emergency Code
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* STEP 3 */}
                {currentStep === 3 && (
                  <View>
                    <Text className="text-xl text-white font-bold mb-5">
                      Secret Emergency Code
                    </Text>

                    <TextInput
                      className="mb-4 border border-gray-400 text-white rounded-lg px-3 py-2 bg-[#1F1F22]/60"
                      placeholder="Your Secret Code"
                      placeholderTextColor="#9ca3af"
                      value={userData.emergencyCode}
                      onChangeText={(text) =>
                        setUserData({ ...userData, emergencyCode: text })
                      }
                    />

                    <TouchableOpacity
                      onPress={handleSaveProfile}
                      className="p-3 bg-[#CF0F47] rounded-lg shadow-md"
                    >
                      <Text className="text-xl font-semibold text-center text-white">
                        Finish Signup
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Back Button */}
                {currentStep > 1 && (
                  <TouchableOpacity
                    onPress={() => setCurrentStep(currentStep - 1)}
                    className="mt-4 p-2 border border-gray-400 rounded-lg"
                  >
                    <Text className="text-white text-center">Back</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Bottom Redirect */}
              <View className="mt-8">
                <TouchableOpacity
                  className="flex flex-row items-center justify-center"
                  onPress={() => router.push("/sign-in")}
                >
                  <Text className="text-white font-semibold">
                    Already a user?{" "}
                  </Text>
                  <Text className="text-base font-semibold underline text-[#CF0F47]">
                    Sign In
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal: Contact Picker */}
            <Modal
              visible={contactsModalVisible}
              animationType="slide"
              onRequestClose={() => setContactsModalVisible(false)}
            >
              <SafeAreaView className="flex-1 bg-[#1B1B1B]">
                <Text className="text-xl font-bold text-center text-white my-4">
                  Select a Contact
                </Text>

                <TextInput
                  className="mx-4 mb-4 border border-gray-500 rounded-lg px-3 py-2 text-white bg-[#2A2A2A]"
                  placeholder="Search Contacts"
                  placeholderTextColor="#9ca3af"
                  value={contactSearch}
                  onChangeText={setContactSearch}
                />

                <FlatList
                  data={filteredContacts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="px-4 py-3 border-b border-gray-600"
                      onPress={() => {
                        const phone = item.phoneNumbers?.[0]?.number || "";
                        const name = item.name || "";
                        const email = item.emails?.[0]?.email || "";

                        const updated = [...userData];
                        updated[targetIndex] = {
                          ...updated[targetIndex],
                          name,
                          phone,
                          email,
                        };
                        setUserData(updated);
                        setContactsModalVisible(false);
                      }}
                    >
                      <Text className="text-white text-lg">{item.name}</Text>
                      {item.phoneNumbers?.length > 0 && (
                        <Text className="text-gray-400">
                          {item.phoneNumbers[0].number}
                        </Text>
                      )}
                      {item.emails?.length > 0 && (
                        <Text className="text-gray-500">
                          {item.emails[0].email}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                />

                <TouchableOpacity
                  className="p-3 m-4 bg-red-600 rounded-lg"
                  onPress={() => setContactsModalVisible(false)}
                >
                  <Text className="text-white text-center font-bold">
                    Close
                  </Text>
                </TouchableOpacity>
              </SafeAreaView>
            </Modal>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SignUp;
