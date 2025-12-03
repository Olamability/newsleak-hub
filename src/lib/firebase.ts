// Firebase config and initialization
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCTKMG2Jo4C1y_adgAF61GyQ8_ER_8_p9g",
  authDomain: "news-aggregator-bb220.firebaseapp.com",
  projectId: "news-aggregator-bb220",
  storageBucket: "news-aggregator-bb220.firebasestorage.app",
  messagingSenderId: "393859722906",
  appId: "1:393859722906:web:2de4c2d2f35aae5b177923"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
