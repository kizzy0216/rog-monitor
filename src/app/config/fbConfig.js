import firebase from 'firebase/app'
import 'firebase/messaging'


var config = {
  apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
  authDomain: "rog-2-0.firebaseapp.com",
  databaseURL: "https://rog-2-0.firebaseio.com",
  projectId: "rog-2-0",
  storageBucket: "rog-2-0.appspot.com",
  messagingSenderId: "153344187169"
};

firebase.initializeApp(config);

export default firebase;
