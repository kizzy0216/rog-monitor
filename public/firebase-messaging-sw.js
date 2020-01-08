importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

// TODO: move this to env config somehow
firebase.initializeApp({
  projectId: "rog-2-0",
  apiKey: "AIzaSyCY1oTVrozQfDrCG1k-b3Q4Iw5iWSF_LIM",
  appId: "1:153344187169:web:64dd90de0f9831cc643c60",
  messagingSenderId: "153344187169"
});

const messaging = firebase.messaging();

// messaging.onMessage(payload => {
//   const title = payload.notification.title;
//   const options = {
//     body: payload.notification.body,
//     data: payload.data,
//     icon: '/favicon.ico'
//   }
//
//   return self.registration.showNotification(title, options);
// });
//
// messaging.setBackgroundMessageHandler(payload => {
//   const title = payload.notification.title;
//   const options = {
//     body: payload.notification.body,
//     data: payload.data,
//     icon: '/favicon.ico'
//   }
//
//   return self.registration.showNotification(title, options);
// });
//
// self.addEventListener('notificationclick', function(event) {
//     let url = event.notification.data.click_action;
//     event.notification.close(); // Android needs explicit close.
//     event.waitUntil(
//         clients.matchAll({type: 'window'}).then( windowClients => {
//             // Check if there is already a window/tab open with the target URL
//             for (var i = 0; i < windowClients.length; i++) {
//                 var client = windowClients[i];
//                 // If so, just focus it.
//                 console.log(client);
//                 if (client.url === url && 'focus' in client) {
//                     return client.focus();
//                 }
//             }
//             // If not, then open the target URL in a new window/tab.
//             if (clients.openWindow) {
//                 return clients.openWindow(url);
//             }
//         })
//     );
// });
