import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore, collection, addDoc, serverTimestamp, GeoPoint } from "firebase/firestore";
import { db } from "../config/firebaseConfig";
import { uploadPhotoToCloudinary, uploadAudioToCloudinary } from "../utils/cloudinary";

let emergencyContacts = [];

export const loadEmergencyContacts = async (user) => {
  try {
    if (user?.contacts) emergencyContacts = user.contacts;
  } catch (error) {
    console.error("Failed to load emergency contacts:", error);
  }
};

export const addEmergencyContact = async (contact) => {
  if (!contact.phone && !contact.email) throw new Error("Contact must have phone or email");
  emergencyContacts.push({ ...contact, id: Date.now().toString() });
  await AsyncStorage.setItem("emergency_contacts", JSON.stringify(emergencyContacts));
};

export const removeEmergencyContact = async (contactId) => {
  emergencyContacts = emergencyContacts.filter(c => c.id !== contactId);
  await AsyncStorage.setItem("emergency_contacts", JSON.stringify(emergencyContacts));
};

export const getEmergencyContacts = () => emergencyContacts;

// Save SOS data
export const saveSOS = async (user, { photoUri, audioUri, location }) => {
  try {
    const photoUrl = await uploadPhotoToCloudinary(photoUri);
    const audioUrl = await uploadAudioToCloudinary(audioUri);

    const payload = {
      userId: user.uid,
      photo: photoUrl,
      audioUrl: audioUrl || null,
      location: location ? new GeoPoint(location.latitude, location.longitude) : null,
      to: { email: emergencyContacts.filter(c => c.email).map(c => c.email), subject: "🚨 Alert from ResQall" },
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "sosHistory"), payload);
    console.log("✅ SOS saved:", payload);
  } catch (error) {
    console.error("Failed to save SOS:", error);
  }
};
