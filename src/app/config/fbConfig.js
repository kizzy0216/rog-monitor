import firebase from 'firebase/app'
import 'firebase/messaging'

// TODO: move this to env config somehow
var config = {
  projectId: "rog-2-0",
  apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
  appId: "1:153344187169:web:64dd90de0f9831cc643c60",
  messagingSenderId: "153344187169"
};

firebase.initializeApp(config);

export default firebase;
