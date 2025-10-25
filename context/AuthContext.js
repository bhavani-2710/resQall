import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "../config/firebaseConfig";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // 🔹 Load Firestore profile using UID
  const loadUserProfile = async (uid) => {
    if (!uid) return null;

    try {
      const userSnap = await getDoc(doc(db, "users", uid));
      if (userSnap.exists()) {
        const profile = userSnap.data();
        // ✅ Only update if changed
        if (JSON.stringify(profile) !== JSON.stringify(user)) {
          setUser(profile);
        }
        return profile;
      }
      return null;
    } catch (err) {
      console.error("Error fetching profile:", err);
      return null;
    }
  };

  // 🔹 Initialize user on app start
  useEffect(() => {
    const init = async () => {
      setAuthLoading(true);
      try {
        const storedUID = await AsyncStorage.getItem("userUID");
        if (storedUID && !user) {
          // prevent repeat calls
          await loadUserProfile(storedUID);
        }
      } catch (err) {
        console.error("Error initializing user:", err);
      } finally {
        setAuthLoading(false);
      }
    };

    init();
  }, []);

  const signup = async ({ email, password, name, ...extraData }) => {
    setAuthLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const currentUser = userCred.user;
      await updateProfile(currentUser, { displayName: name });
      await sendEmailVerification(currentUser);

      const profileData = {
        uid: currentUser.uid,
        name,
        email,
        emailVerified: currentUser.emailVerified,
        createdAt: serverTimestamp(),
        ...extraData,
      };

      await setDoc(doc(db, "users", currentUser.uid), profileData);
      await AsyncStorage.setItem("userUID", currentUser.uid);
      setUser(profileData);

      Alert.alert(
        "Verify Your Email",
        "A verification link has been sent to your email. Please verify to proceed."
      );
      router.replace("/sign-in");
    } catch (err) {
      console.log("❌ Signup failed:", err);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const currentUser = userCredential.user;
      await currentUser.reload();

      if (!currentUser.emailVerified) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email before logging in."
        );
        await signOut(auth);
        setAuthLoading(false);
        return;
      }

      const profileData = await loadUserProfile(currentUser.uid);
      await AsyncStorage.setItem("userUID", currentUser.uid);
      setUser(profileData);
      router.push("/home");
    } catch (err) {
      console.log("❌ Sign-in error:", err);
      Alert.alert(
        "Error Signing In!",
        "Check your credentials or try again later."
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    await AsyncStorage.removeItem("userUID");
    router.replace("/(auth)/sign-in");
  };

  // 🔹 Reload user profile manually
  const reloadUser = async () => {
    if (!user?.uid) return;
    await loadUserProfile(user.uid);
  };

  // 🔹 Emergency code/contacts update with auto-refresh
  const updateEmergencyCode = async (uid, emergencyCode) => {
    if (!uid) return;
    try {
      await setDoc(
        doc(db, "users", uid),
        { emergencyCode, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await reloadUser();
      router.back();
      Alert.alert("Success", "Emergency code updated!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update emergency code.");
    }
  };

  const updateEmergencyContacts = async (uid, contacts) => {
    if (!uid) return;
    try {
      await setDoc(
        doc(db, "users", uid),
        { contacts, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await reloadUser();
      router.back();
      Alert.alert("Success", "Emergency contacts updated!");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update contacts.");
    }
  };

  const changePassword = async () => {
    if (!user) {
      console.error("User is not available");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, user.email);
    } catch (error) {
      console.error("❌ Error sending password reset email:", error);
    }
  };

  const deleteAccount = async () => {
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(currentUser);
        console.log("🗑️ User deleted successfully");
        await AsyncStorage.removeItem("userUID");
        router.replace("/sign-in");
        return { isDeleted: true };
      } catch (error) {
        if (error.code === "auth/requires-recent-login") {
          // Prompt user to reauthenticate
          return {
            isDeleted: false,
            message: "Please reauthenticate and try again.",
          };
        } else {
          console.log("❌ Error deleting user:", error);
          return { isDeleted: false, message: "❌ Error deleting user." };
        }
      }
    } else {
      return {
        isDeleted: false,
        message: "Please reauthenticate and try again.",
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isLoggedIn: !!user,
        signup,
        login,
        logout,
        reloadUser,
        updateEmergencyCode,
        updateEmergencyContacts,
        changePassword,
        deleteAccount,
        loadUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
