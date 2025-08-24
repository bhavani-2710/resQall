// context/AuthContext.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebaseConfig";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  // 🔹 Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const mergedUser = await loadUserProfile(firebaseUser);
        setUser(mergedUser);
        await AsyncStorage.setItem("userUID", firebaseUser.uid);
      } else {
        setUser(null);
        await AsyncStorage.removeItem("userUID");
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

// 🔹 Signup
const signup = async (userData) => {
  setAuthLoading(true);
  try {
    const { email, password, ...extraData } = userData;

    // Create Firebase Auth user
    const userCred = await createUserWithEmailAndPassword(auth, email, password);
    const userRef = doc(db, "users", userCred.user.uid);

    // Firestore profile
    const profileData = {
      email,
      createdAt: new Date().toISOString(),
      ...extraData,
    };

    await setDoc(userRef, profileData);

    // Merge Auth + Firestore data
    const mergedUser = {
      uid: userCred.user.uid,
      email,
      ...profileData,
    };

    setUser(mergedUser);
    await AsyncStorage.setItem("userUID", userCred.user.uid);

    return mergedUser;
  } catch (err) {
    console.error("❌ Signup failed:", err);
    throw err;
  } finally {
    setAuthLoading(false);
  }
};


  // 🔹 Login
  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const mergedUser = await loadUserProfile(userCred.user);

      setUser(mergedUser);
      await AsyncStorage.setItem("userUID", userCred.user.uid);

      return mergedUser;
    } catch (err) {
      console.error("❌ Login failed:", err);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      await AsyncStorage.removeItem("userUID");
    } catch (err) {
      console.error("❌ Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        setAuthLoading,
        signup,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
