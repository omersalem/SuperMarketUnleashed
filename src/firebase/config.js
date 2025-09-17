import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA6WS6gXCEIbzGElJuqNgfrLH0XyriGe80",
  authDomain: "supermarket-abd34.firebaseapp.com",
  projectId: "supermarket-abd34",
  storageBucket: "supermarket-abd34.firebasestorage.app",
  messagingSenderId: "377779793572",
  appId: "1:377779793572:web:a1db78a2ee761bd39f4031",
  measurementId: "G-88PHEP5JPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

isSupported().then((supported) => {
  if (supported) {
    getAnalytics(app);
  }
});

export default app;
