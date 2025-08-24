import AntDesign from "@expo/vector-icons/AntDesign";
import * as Contacts from "expo-contacts";
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

  // Control step-wise flow
  const [currentStep, setCurrentStep] = useState(1);

  // Signup form state (holds data across steps)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    contacts: [{ name: "", phone: "", email: "" }], // Start with 1 contact
    emergencyCode: "",
  });

  // Modal state for contact picker
  const [contactPermissionStatus, setContactPermissionStatus] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [targetIndex, setTargetIndex] = useState(null);

  // STEP 1: Handle Firebase Auth Signup
  const handleSignupBasic = async (values) => {
    try {
      setUserData({ ...userData, ...values });
      setCurrentStep(2);
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  // STEP 3: Save final profile to Firestore
  const handleSaveProfile = async () => {
    try {
      console.log(userData);
      signup(userData);
      Alert.alert("Signup Complete!");
      // router.replace("/home");
    } catch (err) {
      Alert.alert(err.message);
    }
  };

  // Open Contact Picker (expo-contacts)
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
        Alert.alert("No contacts with phone numbers found.");
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

  // Filter contacts based on search
  const filteredContacts = availableContacts.filter((item) =>
    item.name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  return (
    <SafeAreaView className="bg-[#28282B] flex-1">
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
              Let's get you started!
            </Text>

            <View className="w-5/6">
              {/* STEP 1: Basic Info */}
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
                    <View className="w-full">
                      <TextInput
                        className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                        onChangeText={handleChange("name")}
                        onBlur={handleBlur("name")}
                        value={values.name}
                        placeholder="Name"
                        placeholderTextColor="#9ca3af"
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
                        placeholderTextColor="#9ca3af"
                      />
                      {touched.email && errors.email && (
                        <Text className="text-red-500 text-xs mb-2">
                          {errors.email}
                        </Text>
                      )}

                      <TextInput
                        className="my-2.5 h-12 border border-white text-white text-lg rounded-lg px-3"
                        secureTextEntry
                        onChangeText={handleChange("password")}
                        onBlur={handleBlur("password")}
                        value={values.password}
                        placeholder="Password"
                        placeholderTextColor="#9ca3af"
                      />
                      {touched.password && errors.password && (
                        <Text className="text-red-500 text-xs mb-2">
                          {errors.password}
                        </Text>
                      )}

                      <TouchableOpacity
                        onPress={handleSubmit}
                        className="p-3 my-10 bg-[#CF0F47] rounded-lg"
                      >
                        <Text className="text-xl font-semibold text-center text-white">
                          Next: Emergency Contacts
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Formik>
              )}

              {/* STEP 2: Emergency Contacts */}
              {currentStep === 2 && (
                <View>
                  <Text className="text-xl text-white font-bold mb-5">
                    Emergency Contacts
                  </Text>

                  {userData.contacts.map((contact, index) => (
                    <View
                      key={index}
                      className="mb-6 border border-white rounded-xl p-4"
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
                            <Text className="text-red-500">Remove</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <TextInput
                        className="mb-2 border border-white text-white rounded-lg px-3 py-2"
                        placeholder="Name"
                        placeholderTextColor="#9ca3af"
                        value={contact.name}
                        onChangeText={(text) => {
                          const updated = [...userData.contacts];
                          updated[index].name = text;
                          setUserData({ ...userData, contacts: updated });
                        }}
                      />

                      <TextInput
                        className="mb-2 border border-white text-white rounded-lg px-3 py-2"
                        placeholder="Phone"
                        placeholderTextColor="#9ca3af"
                        value={contact.phone}
                        onChangeText={(text) => {
                          const updated = [...userData.contacts];
                          updated[index].phone = text;
                          setUserData({ ...userData, contacts: updated });
                        }}
                      />

                      <TextInput
                        className="border border-white text-white rounded-lg px-3 py-2"
                        placeholder="Email"
                        placeholderTextColor="#9ca3af"
                        value={contact.email}
                        onChangeText={(text) => {
                          const updated = [...userData.contacts];
                          updated[index].email = text;
                          setUserData({ ...userData, contacts: updated });
                        }}
                      />

                      <TouchableOpacity
                        onPress={() => openContactsPicker(index)}
                        className="mt-3 bg-white px-3 py-2 rounded-lg"
                      >
                        <Text className="text-[#28282B] text-center">
                          Pick from Contacts
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}

                  {/* Add More Contacts */}
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
                        <AntDesign name="pluscircle" size={16} color="white" />
                        <Text className="text-white text-center font-medium text-sm">
                          Add Another Contact
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}

                  {/* Proceed Button */}
                  <TouchableOpacity
                    onPress={() => {
                      const firstContact = userData.contacts[0];
                      if (
                        firstContact.name.trim() === "" ||
                        firstContact.phone.trim() === "" ||
                        firstContact.email.trim() === ""
                      ) {
                        Alert.alert("Atleast 1 emergency contact is required.");
                      } else {
                        setCurrentStep(3);
                      }
                    }}
                    className="p-3 bg-[#CF0F47] rounded-lg"
                  >
                    <Text className="text-xl font-semibold text-center text-white">
                      Next: Emergency Code
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* STEP 3: Secret Emergency Code */}
              {currentStep === 3 && (
                <View>
                  <Text className="text-xl text-white font-bold mb-5">
                    Secret Emergency Code
                  </Text>

                  <TextInput
                    className="mb-4 border border-white text-white rounded-lg px-3 py-2"
                    placeholder="Your Secret Code"
                    placeholderTextColor="#9ca3af"
                    value={userData.emergencyCode}
                    onChangeText={(text) =>
                      setUserData({ ...userData, emergencyCode: text })
                    }
                  />

                  <TouchableOpacity
                    onPress={handleSaveProfile}
                    className="p-3 bg-[#CF0F47] rounded-lg"
                  >
                    <Text className="text-xl font-semibold text-center text-white">
                      Finish Signup
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Optional Back Button */}
              {currentStep > 1 && (
                <TouchableOpacity
                  onPress={() => setCurrentStep(currentStep - 1)}
                  className="mt-4 p-2 border border-white rounded-lg"
                >
                  <Text className="text-white text-center">Back</Text>
                </TouchableOpacity>
              )}
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
            <SafeAreaView className="flex-1 bg-white">
              <Text className="text-xl font-bold text-center my-4">
                Select a Contact
              </Text>

              {/* Search Bar */}
              <TextInput
                className="mx-4 mb-4 border border-gray-400 rounded-lg px-3 py-2"
                placeholder="Search Contacts"
                placeholderTextColor="#9ca3af"
                value={contactSearch}
                onChangeText={setContactSearch}
              />

              {/* Contact List */}
              <FlatList
                data={filteredContacts}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className="px-4 py-1 border-b border-gray-300"
                    onPress={() => {
                      const phone = item.phoneNumbers[0]?.number || "";
                      const name = item.name || "";
                      const email = item.emails
                        ? item.emails[0]?.email || ""
                        : "";
                      const updated = [...userData.contacts];
                      updated[targetIndex] = { name, phone, email };
                      setUserData({ ...userData, contacts: updated });

                      setContactsModalVisible(false);
                    }}
                  >
                    <Text className="text-lg font-normal text-[#28282B]">
                      {item.name}
                    </Text>
                    {item.phoneNumbers?.length > 0 && (
                      <Text className="text-gray-500">
                        {item.phoneNumbers[0].number}
                      </Text>
                    )}
                    {item.emails?.length > 0 && (
                      <Text className="text-gray-400">
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
                <Text className="text-white text-center font-bold">Close</Text>
              </TouchableOpacity>
            </SafeAreaView>
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUp;
