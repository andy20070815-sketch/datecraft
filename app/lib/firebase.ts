"use client";

import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBBcrOzQ4KBo-YVh6B7fP-Q4K1fBoznWBk",
  authDomain: "datecraft-f6d29.firebaseapp.com",
  projectId: "datecraft-f6d29",
  storageBucket: "datecraft-f6d29.firebasestorage.app",
  messagingSenderId: "670074668416",
  appId: "1:670074668416:web:f9e4f907f1649a77ea6d65",
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
