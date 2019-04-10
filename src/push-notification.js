import firebase from 'firebase';

export const initializeFirebase = () => {
  var config = {
    apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
    authDomain: "rog-2-0.firebaseapp.com",
    databaseURL: "https://rog-2-0.firebaseio.com",
    projectId: "rog-2-0",
    storageBucket: "rog-2-0.appspot.com",
    messagingSenderId: "153344187169"
  };

  firebase.initializeApp(config);
}

export const askForPermissionToReceiveNotifications = async () => {
  try {
    const messaging = firebase.messaging();
    await messaging.requestPermission();
    const token = await messaging.getToken();
    console.log('user token:', token);

    return token;
  } catch (error) {
    console.error(error);
  }
}

messaging.onMessage(function(payload) {
  console.log('onMessage: ', payload);
})
