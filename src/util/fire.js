import firebase from 'firebase';
import "firebase/auth";
import "firebase/firestore";

import { API_KEY, APP_ID} from "./fireKeys";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "the-distraction-shield.firebaseapp.com",
  databaseURL: "https://the-distraction-shield.firebaseio.com",
  projectId: "the-distraction-shield",
  storageBucket: "the-distraction-shield.appspot.com",
  messagingSenderId: "700316556439",
  appId: APP_ID,
  measurementId: "G-41MPJ75ND6"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export const provider = new firebase.auth.GoogleAuthProvider();

export const auth = firebase.auth();

export default firebase;