importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// TODO: move this to env config somehow
firebase.initializeApp({
  messagingSenderId: "153344187169"
});

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(payload => {
  const title = payload.notification.title;
  const options = {
    body: payload.notification.body,
    data: payload.data,
    icon: '/favicon.ico'
  }

  return self.registration.showNotification(title, options);
});
