import firebase from 'firebase/app';
import 'firebase/firestore';

import { API_KEY, APP_ID} from "./fireKeys";

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: "aiki-ecf9c.firebaseapp.com",
  databaseURL: "https://aiki-ecf9c.firebaseio.com",
  projectId: "aiki-ecf9c",
  storageBucket: "aiki-ecf9c.appspot.com",
  messagingSenderId: "435184665385",
  appId: APP_ID
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase;