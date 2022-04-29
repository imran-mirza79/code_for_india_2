import Firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import firebase1 from 'firebase';
// eslint-disable-next-line import/named
import { seedDatabase } from '../seed.js';

const config = {
  apiKey: "AIzaSyCEIilJQ62rREULUL08HB7XbxaXMnGKCic",
  authDomain: "code-for-india.firebaseapp.com",
  projectId: "code-for-india",
  storageBucket: "code-for-india.appspot.com",
  messagingSenderId: "395447610224",
  appId: "1:395447610224:web:50f6b3bb474ef3701c7db5",
  measurementId: "G-3MS77L1RF9"
};

const firebase = Firebase.initializeApp(config);
const { FieldValue } = Firebase.firestore;
const storage = firebase1.storage();

// seedDatabase(firebase);
export { storage, firebase, FieldValue };
