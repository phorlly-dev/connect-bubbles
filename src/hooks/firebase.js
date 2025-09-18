// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBCLMq5V0fOjdiZpuHhP4YigSNBP613YRM",
    authDomain: "game-app-bdcf1.firebaseapp.com",
    projectId: "game-app-bdcf1",
    storageBucket: "game-app-bdcf1.firebasestorage.app",
    messagingSenderId: "415399221456",
    appId: "1:415399221456:web:d52a3c949c3c2f7b98a6d5",
    measurementId: "G-0R81BJH15Z",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { db, analytics };
