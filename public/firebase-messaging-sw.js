// firebase-messaging-sw.js

importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const encodedConfig = '%REACT_APP_ENCODED_FIREBASE_CONFIG%'
const firebaseConfig = JSON.parse(atob(encodedConfig));
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);
  // Display the message in the background
  self.registration.showNotification(payload.data.title, {
    body: payload.data.message,
  });
});



