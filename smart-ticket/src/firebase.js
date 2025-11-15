import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDoWvg7Wqx8730oFqMHmpSn1IsBg-o5kKU",
  authDomain: "smart-ticket-booking-cb8b2.firebaseapp.com",
  projectId: "smart-ticket-booking-cb8b2",
  storageBucket: "smart-ticket-booking-cb8b2.firebasestorage.app",
  messagingSenderId: "434929952578",
  appId: "1:434929952578:web:b4a10b431b5483d10a4adb",
  measurementId: "G-WJB063JDN0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Google login
export const googleLogin = () => {
  return signInWithPopup(auth, googleProvider);
};

// Email signup
export const emailSignup = (email, password) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

// Email login
export const emailLogin = (email, password) => {
  return signInWithEmailAndPassword(auth, password);
};

// Logout
export const logoutFirebase = () => signOut(auth);
