// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCO9pD1cV3x8_ZwuK_4hXwcTDZfrl9RS3Y",
  authDomain: "digital-maturity-assessment.firebaseapp.com",
  projectId: "digital-maturity-assessment",
  storageBucket: "digital-maturity-assessment.firebasestorage.app",
  messagingSenderId: "90854771497",
  appId: "1:90854771497:web:a6dba584bd0447b5cb8538",
  measurementId: "G-6WPCE8HP4C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);