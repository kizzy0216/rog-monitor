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

messaging.setBackgroundMessageHandler(payload => {
  console.log(payload);
  const title = payload.notification.title;
  // console.log('payload', payload.notification.icon);
  const options = {
    body: payload.notification.body,
    // data: payload.data
    // icon: payload.notification.icon
  }
  return self.registration.showNotification(title, options);
})

self.addEventListener("notificationclick", function(event) {
  const clickedNotification = event.notification;
  clickedNotification.close();
  const promiseChain = clients
    .matchAll({
      type: "window",
      includeUncontrolled: true
    })
    .then(windowClients => {
      let matchingClient = null;
      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.url === feClickAction) {
          matchingClient = windowClient;
            break;
          }
        }
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(feClickAction);
        }
    });
  event.waitUntil(promiseChain);
});
