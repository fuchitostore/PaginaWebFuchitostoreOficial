// ══════════════════════════════════════════════════════════════
//  mensajeria.js  —  FuchitoStore
//  Mensajería en tiempo real usuario a usuario.
//  Usa el SDK "compat" de Firebase (igual que auth.js / firebase-config.js).
//  Requiere que firebase-config.js y auth.js se carguen ANTES que este archivo.
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  function getChatId(uidA, uidB) {
    return [uidA, uidB].sort().join('_');
  }

  // Crea (si no existe) y devuelve el id de la conversación entre dos usuarios.
  function iniciarChat(otroUid) {
    var user = window.FS_AUTH.currentUser;
    if (!user) return Promise.reject(new Error('No hay sesión activa.'));

    var chatId = getChatId(user.uid, otroUid);
    var chatRef = window.FS_DB.collection('chats').doc(chatId);

    return chatRef.get().then(function (snap) {
      if (!snap.exists) {
        return chatRef.set({
          participants: [user.uid, otroUid],
          lastMessage: '',
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
    }).then(function () {
      return chatId;
    });
  }

  // Envía un mensaje dentro de un chat existente.
  function enviarMensaje(chatId, texto) {
    var user = window.FS_AUTH.currentUser;
    if (!user) return Promise.reject(new Error('No hay sesión activa.'));
    texto = (texto || '').trim();
    if (!texto) return Promise.resolve();

    var messagesRef = window.FS_DB.collection('chats').doc(chatId).collection('messages');

    return messagesRef.add({
      senderId: user.uid,
      text: texto,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(function () {
      return window.FS_DB.collection('chats').doc(chatId).update({
        lastMessage: texto,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
      });
    });
  }

  // Escucha los mensajes de un chat en tiempo real.
  // callback recibe un array de mensajes ordenados cronológicamente.
  // Devuelve una función para dejar de escuchar (llámala al salir del chat).
  function escucharMensajes(chatId, callback) {
    var messagesRef = window.FS_DB.collection('chats').doc(chatId)
      .collection('messages').orderBy('timestamp', 'asc');

    return messagesRef.onSnapshot(function (snapshot) {
      var mensajes = snapshot.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      callback(mensajes);
    });
  }

  // Escucha la lista de conversaciones del usuario actual en tiempo real.
  function escucharChats(callback) {
    var user = window.FS_AUTH.currentUser;
    if (!user) throw new Error('No hay sesión activa.');

    var q = window.FS_DB.collection('chats')
      .where('participants', 'array-contains', user.uid)
      .orderBy('lastUpdated', 'desc');

    return q.onSnapshot(function (snapshot) {
      var chats = snapshot.docs.map(function (d) {
        return Object.assign({ id: d.id }, d.data());
      });
      callback(chats);
    });
  }

  // Obtiene el perfil público (nombre, foto) de un usuario por su uid.
  function obtenerPerfilPublico(uid) {
    return window.FS_DB.collection('perfilesPublicos').doc(uid).get().then(function (snap) {
      return snap.exists ? snap.data() : null;
    });
  }

  window.FS_MSG = {
    iniciarChat: iniciarChat,
    enviarMensaje: enviarMensaje,
    escucharMensajes: escucharMensajes,
    escucharChats: escucharChats,
    obtenerPerfilPublico: obtenerPerfilPublico
  };

})();
