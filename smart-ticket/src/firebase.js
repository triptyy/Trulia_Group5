// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDoWvg7Wqx8730oFqMHmpSn1IsBg-o5kKU",
  authDomain: "smart-ticket-booking-cb8b2.firebaseapp.com",
  projectId: "smart-ticket-booking-cb8b2",
  storageBucket: "smart-ticket-booking-cb8b2.appspot.com",
  messagingSenderId: "434929952578",
  appId: "1:434929952578:web:b4a10b431b5483d10a4adb"
};

const app = initializeApp(firebaseConfig);

// Auth exports (client)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const googleLogin = () => signInWithPopup(auth, googleProvider);
export const emailSignup = (email, password, displayName) =>
  createUserWithEmailAndPassword(auth, email, password).then(async (res) => {
    if (displayName) await updateProfile(res.user, { displayName });
    return res;
  });
export const emailLogin = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);
export const logoutFirebase = () => signOut(auth);
export const onAuthChanged = (cb) => onAuthStateChanged(auth, cb);

// Firestore client
export const db = getFirestore(app);
