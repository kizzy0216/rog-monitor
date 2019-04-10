importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
firebase.initializeApp({
  apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
  authDomain: "rog-2-0.firebaseapp.com",
  databaseURL: "https://rog-2-0.firebaseio.com",
  projectId: "rog-2-0",
  storageBucket: "rog-2-0.appspot.com",
  messagingSenderId: "153344187169"
});
const messaging = firebase.messaging();
