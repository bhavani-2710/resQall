import { AntDesign } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
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

export default function ProfileScreen() {
  const { user, updateEmergencyDetails } = useAuth();
  const [userData, setUserData] = useState([]);
  const [emergencyCode, setEmergencyCode] = useState("");

  // Modal state for contact picker
  const [contactPermissionStatus, setContactPermissionStatus] = useState(false);
  const [contactsModalVisible, setContactsModalVisible] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [contactSearch, setContactSearch] = useState("");
  const [targetIndex, setTargetIndex] = useState(null);

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

  useEffect(() => {
    // Load contacts from DB/user
    if (user?.contacts?.length > 0) {
      setUserData(
        user.contacts.map((c, idx) => ({
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
    const updated = userData.filter((c) => c.id !== id);
    setUserData(updated);
  };

  const handleAddContact = () => {
    if (userData.length >= 5) {
      Alert.alert("Limit reached", "You can only add up to 5 contacts.");
      return;
    }
    setUserData([
      ...userData,
      { id: Date.now().toString(), name: "", phone: "", email: "" },
    ]);
  };

  const handleProceed = () => {
    const firstContact = userData[0];
    if (!firstContact.name || !firstContact.phone || !firstContact.email) {
      Alert.alert("At least 1 complete emergency contact is required.");
      return;
    }

    if (!emergencyCode.trim()) {
      Alert.alert("Emergency code is required.");
      return;
    }
    // Save both contacts + code
    updateEmergencyDetails(user.uid, userData, emergencyCode.trim());
  };

  useEffect(() => {
    if (user?.emergencyCode) {
      setEmergencyCode(user.emergencyCode);
    } else {
      setEmergencyCode("Help me!"); // default
    }
  }, [user]);

  return (
    <SafeAreaView className="bg-[#FFDEDE] flex-1 px-5 pt-12">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Text className="text-3xl font-extrabold text-[#28282B] m-auto underline underline-offset-8 mb-6">
            User Profile
          </Text>

          <View className="space-y-2 mb-6">
            <Text className="text-base font-medium text-[#28282B] opacity-80">
              Name: {user?.name || "Guest"}
            </Text>
            <Text
              numberOfLines={1} // ✅ truncate if too long
              ellipsizeMode="tail" // ✅ adds "..."
              className="text-base font-medium text-[#28282B] opacity-80 mt-1"
            >
              Email: {user?.email || "No Email"}
            </Text>
          </View>

          <Text className="text-base font-bold text-[#CF0F47] mb-2">
            Emergency Code
          </Text>
          <TextInput
            className="border border-[#28282B] text-[#28282B] rounded-lg px-3 py-2 mb-6 bg-white"
            placeholder="Enter your emergency code"
            placeholderTextColor="#797979"
            value={emergencyCode}
            onChangeText={setEmergencyCode}
          />

          {/* Form Section */}
          <Text className="text-base font-bold text-[#343434] mb-3">
            Add/Update Emergency Contacts
          </Text>

          {userData.map((contact, index) => (
            <View
              key={contact.id}
              className="mb-6 border border-[#28282B] rounded-xl p-4 bg-white"
            >
              <View className="flex flex-row justify-between items-center mb-2">
                <Text className="text-[#28282B] font-semibold">
                  Contact-{index + 1}
                </Text>
                <TouchableOpacity
                  onPress={() => handleDeleteContact(contact.id)}
                >
                  <Text className="text-red-500">Remove</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                className="mb-2 border border-[#28282B] text-[#28282B] rounded-lg px-3 py-2"
                placeholder="Name"
                placeholderTextColor="#797979"
                value={contact.name}
                onChangeText={(text) => {
                  const updated = [...userData];
                  updated[index].name = text;
                  setUserData(updated);
                }}
              />
              <TextInput
                className="mb-2 border border-[#28282B] text-[#28282B] rounded-lg px-3 py-2"
                placeholder="Phone"
                placeholderTextColor="#797979"
                value={contact.phone}
                onChangeText={(text) => {
                  const updated = [...userData];
                  updated[index].phone = text;
                  setUserData(updated);
                }}
              />
              <TextInput
                className="border border-[#28282B] text-[#28282B] rounded-lg px-3 py-2"
                placeholder="Email"
                placeholderTextColor="#797979"
                value={contact.email}
                onChangeText={(text) => {
                  const updated = [...userData];
                  updated[index].email = text;
                  setUserData(updated);
                }}
              />

              <TouchableOpacity
                onPress={() => openContactsPicker(index)}
                className="mt-3 bg-[#343434] px-3 py-2 rounded-lg"
              >
                <Text className="text-white text-center">
                  Pick from Contacts
                </Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Add More Contacts */}
          {userData.length < 5 && (
            <TouchableOpacity
              onPress={handleAddContact}
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
            onPress={handleProceed}
            className="p-3 bg-[#CF0F47] rounded-lg"
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
                    className="px-4 py-3 border-b border-gray-300"
                    onPress={() => {
                      const phone = item.phoneNumbers?.[0]?.number || "";
                      const name = item.name || "";
                      const email = item.emails?.[0]?.email || "";

                      // Copy current contacts
                      const updated = [...userData];

                      // Keep ID intact while replacing data
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
}
