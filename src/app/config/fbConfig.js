import firebase from 'firebase/app'
import 'firebase/messaging'

// TODO: move this to env config somehow
var config = {
  messagingSenderId: "153344187169"
};

firebase.initializeApp(config);

export default firebase;
