import { AntDesign, Ionicons } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import uuid from "react-native-uuid";
import { useAuth } from "../../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";

const ContactsSettings = () => {
  const router = useRouter();
  const { user, updateEmergencyContacts } = useAuth();
  const [userData, setUserData] = useState([]);

  const [contactPermissionStatus, setContactPermissionStatus] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [targetIndex, setTargetIndex] = useState(null);

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

  const filteredContacts = availableContacts.filter((item) =>
    item.name?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  useEffect(() => {
    if (user?.contacts?.length > 0) {
      setUserData(
        user.contacts.map((c) => ({
          ...c,
          id: uuid.v4(),
        }))
      );
    } else {
      setUserData([{ id: uuid.v4(), name: "", phone: "", email: "" }]);
    }
  }, [user]);

  const handleDeleteContact = (id) => {
    if (userData.length === 1) {
      Alert.alert(
        "At least 1 contact required",
        "You must have at least one contact."
      );
      return;
    }
    setUserData(userData.filter((c) => c.id !== id));
  };

  const handleAddContact = () => {
    if (userData.length >= 5) {
      Alert.alert("Limit reached", "You can only add up to 5 contacts.");
      return;
    }
    setUserData([...userData, { id: Date.now().toString(), name: "", phone: "", email: "" }]);
  };

  const handleProceed = () => {
    const firstContact = userData[0];
    if (!firstContact.name || !firstContact.phone || !firstContact.email) {
      Alert.alert("At least 1 complete emergency contact is required.");
      return;
    }
    updateEmergencyContacts(user.uid, userData);
  };

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient
        colors={["#1B1B1B", "#2A2A2A", "#3A3A3A"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="flex-1 px-5 pt-12"
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <View className="flex flex-row items-center gap-5 mb-6">
              <TouchableOpacity
                onPress={() => router.back()}
                className="p-2 rounded-full border-2 border-[#E60023] bg-[#2A2A2A]"
              >
                <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Header */}
            <Text className="text-3xl font-extrabold text-white mb-8">
              Edit Emergency Contacts
            </Text>

            {/* Form Section */}
            <Text className="text-xl font-bold text-[#E0E0E0] mb-3">
              Add/Update Emergency Contacts
            </Text>

            {userData.map((contact, index) => (
              <View
                key={contact.id}
                className="mb-6 border border-gray-600 rounded-xl p-4 bg-[#2A2A2A]"
              >
                <View className="flex flex-row justify-between items-center mb-2">
                  <Text className="text-white font-semibold">
                    Contact-{index + 1}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDeleteContact(contact.id)}
                  >
                    <Text className="text-red-600">Remove</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  className="mb-2 border border-gray-500 text-white rounded-lg px-3 py-2 bg-[#1E1E1E]"
                  placeholder="Name"
                  placeholderTextColor="#9ca3af"
                  value={contact.name}
                  onChangeText={(text) => {
                    const updated = [...userData];
                    updated[index].name = text;
                    setUserData(updated);
                  }}
                />
                <TextInput
                  className="mb-2 border border-gray-500 text-white rounded-lg px-3 py-2 bg-[#1E1E1E]"
                  placeholder="Phone"
                  placeholderTextColor="#9ca3af"
                  value={contact.phone}
                  onChangeText={(text) => {
                    const updated = [...userData];
                    updated[index].phone = text;
                    setUserData(updated);
                  }}
                />
                <TextInput
                  className="border border-gray-500 text-white rounded-lg px-3 py-2 bg-[#1E1E1E]"
                  placeholder="Email"
                  placeholderTextColor="#9ca3af"
                  value={contact.email}
                  onChangeText={(text) => {
                    const updated = [...userData];
                    updated[index].email = text;
                    setUserData(updated);
                  }}
                />

                <TouchableOpacity
                  onPress={() => openContactsPicker(index)}
                  className="mt-3 bg-white px-3 py-2 rounded-lg"
                >
                  <Text className="text-black text-center">
                    Pick from Contacts
                  </Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add More Contacts */}
            {userData.length < 5 && (
              <TouchableOpacity
                onPress={handleAddContact}
                className="p-3 bg-[#E60023] rounded-lg mb-4 flex-row justify-center items-center gap-2"
              >
                <AntDesign name="pluscircle" size={16} color="white" />
                <Text className="text-white font-medium text-sm">
                  Add Another Contact
                </Text>
              </TouchableOpacity>
            )}

            {/* Proceed Button */}
            <TouchableOpacity
              onPress={handleProceed}
              className="p-3 bg-[#E60023] rounded-lg mb-6"
            >
              <Text className="text-xl font-semibold text-center text-white">
                Save Changes
              </Text>
            </TouchableOpacity>

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
                        updated[targetIndex] = { ...updated[targetIndex], name, phone, email };
                        setUserData(updated);
                        setContactsModalVisible(false);
                      }}
                    >
                      <Text className="text-white text-lg">{item.name}</Text>
                      {item.phoneNumbers?.length > 0 && (
                        <Text className="text-gray-400">{item.phoneNumbers[0].number}</Text>
                      )}
                      {item.emails?.length > 0 && (
                        <Text className="text-gray-500">{item.emails[0].email}</Text>
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
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ContactsSettings;
