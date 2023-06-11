importScripts(
  "https://www.gstatic.com/firebasejs/9.8.4/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.8.4/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyCW-1x8Rm7P8oS2bQ6_SLHjHRIRvXyB5aY",
  authDomain: "treasure-rush-prod.firebaseapp.com",
  projectId: "treasure-rush-prod",
  storageBucket: "treasure-rush-prod.appspot.com",
  messagingSenderId: "115922892486",
  appId: "1:115922892486:web:fc836ec0f060cf09ee89c7",
});

const isSupported = firebase.messaging.isSupported();
if (isSupported) {
  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(({ notification: { title, body, image } }) => {
    self.registration.showNotification(title, {
      body,
    });
  });
}
