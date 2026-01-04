// Firebase Configuration
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBSK8v9RGRBliit4AKeT6ASEbse-GAgQ7w",
    authDomain: "devmobile-18e78.firebaseapp.com",
    projectId: "devmobile-18e78",
    storageBucket: "devmobile-18e78.firebasestorage.app",
    messagingSenderId: "314586571310",
    appId: "1:314586571310:web:c8dca3e1805bed4620f5bf",
    measurementId: "G-C084GDFD8T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics is optional and might crash in React Native if not handled correctly with expo-firebase-analytics, 
// so we'll leave it commented out for now unless specifically requested/needed.
// const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;
