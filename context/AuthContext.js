// context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { auth, db } from "../config/firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const router = useRouter();

  // 🔹 Merge Firebase Auth + Firestore profile
  const loadUserProfile = async (firebaseUser) => {
    if (!firebaseUser) return null;

    try {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      const profileData = userSnap.exists() ? userSnap.data() : {};

      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        ...profileData,
      };
    } catch (err) {
      console.error("❌ Error fetching Firestore profile:", err);
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
      };
    }
  };

  useEffect(() => {
    if (!auth) return; // prevent running early

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔹 Signup
  const signup = async (userData) => {
    setAuthLoading(true);
    try {
      const { email, password, name, ...extraData } = userData;

      // Create Firebase Auth user
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const currentUser = userCred.user;
      await updateProfile(currentUser, { displayName: name });

      await sendEmailVerification(currentUser);

      const userRef = doc(db, "users", userCred.user.uid);

      // Firestore profile
      const profileData = {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
        createdAt: serverTimestamp(),
        ...extraData,
      };

      await setDoc(userRef, profileData);

      const userSnap = await getDoc(doc(db, "users", currentUser.uid));
      setUser(userSnap.data());

      await AsyncStorage.setItem("userUID", currentUser.uid);

      Alert.alert(
        "Verify Your Email",
        "A verification link has been sent to your email. Please verify to proceed."
      );
      router.replace("/sign-in");
    } catch (err) {
      console.error("❌ Signup failed:", err);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔹 Login
  const login = async (email, password) => {
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
        await signOut(auth); // 👈 force sign out
        return;
      } else if (currentUser.emailVerified) {
        await setDoc(
          doc(db, "users", currentUser.uid),
          { emailVerified: true },
          { merge: true } // 🔥 merge so you don't overwrite existing data
        );

        // Fetch from firestore
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        const user = userSnap.data();
        setUser(user);
        await AsyncStorage.setItem("userUID", userCredential.user.uid);
        router.push("/home");
      }
    } catch (error) {
      console.log("❌ Sign-in error:", error);
      if (error.code === "auth/invalid-credential") {
        Alert.alert(
          "Sign In Failed!",
          "Incorrect Credentials. Please try again",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Error Signing In!",
          "An unexpected error occurred. Please try again later.",
          [{ text: "OK" }]
        );
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    AsyncStorage.removeItem("userUID");
    router.replace("/");
  };

  const changeName = async (newName) => {
    if (!user) {
      console.error("User is not available");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", user.uid),
        { name: newName },
        { merge: true }
      );
      const userSnap = await getDoc(doc(db, "users", user.uid));
      setUser(userSnap.data());
      return;
    } catch (error) {
      console.error("❌ Error updating name:", error);
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
        await AsyncStorage.removeItem("userUID1");
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
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isLoggedIn: !!user,
        authLoading,
        setAuthLoading,
        login,
        signup,
        logout,
        changeName,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
