// ══════════════════════════════════════════════════════════════
//  firebase-config.js  —  FuchitoStore
//  Credenciales reales del proyecto fuchitostore-fab2a
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  var firebaseConfig = {
    apiKey:            "AIzaSyBA7xclj3m4YxTXh8_f_oQF3hLSCs2-vwQ",
    authDomain:        "fuchitostore-fab2a.firebaseapp.com",
    projectId:         "fuchitostore-fab2a",
    storageBucket:     "fuchitostore-fab2a.firebasestorage.app",
    messagingSenderId: "133792974583",
    appId:             "1:133792974583:web:d630af7be05544852175f2",
    measurementId:     "G-68G2P2Z8Y2"
  };

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.FS_AUTH = firebase.auth();
  window.FS_DB   = firebase.firestore();

  window.FS_AUTH.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .catch(function (err) { console.warn('[FuchitoStore] Auth persistence:', err.message); });

  console.log('[FuchitoStore] Firebase inicializado ✔');
})();
