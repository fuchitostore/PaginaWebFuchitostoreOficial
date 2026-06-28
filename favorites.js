// ══════════════════════════════════════════════════════════════
//  favorites.js  —  FuchitoStore
//  Botón ❤️ en cada tarjeta de producto, guardado en Firestore
//  Depende de: firebase-config.js, auth.js
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Estilos ────────────────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '.fs-fav-btn{',
      'position:absolute;top:12px;right:12px;',
      'background:rgba(9,9,15,0.75);backdrop-filter:blur(6px);',
      'border:1px solid rgba(255,255,255,0.1);border-radius:50%;',
      'width:34px;height:34px;display:flex;align-items:center;',
      'justify-content:center;cursor:pointer;',
      'font-size:1rem;transition:all 0.2s;z-index:2;',
    '}',
    '.fs-fav-btn:hover{border-color:rgba(255,80,80,0.5);transform:scale(1.1)}',
    '.fs-fav-btn.active{',
      'background:rgba(255,59,59,0.15);',
      'border-color:rgba(255,59,59,0.4);',
    '}',
    /* Toast */
    '#fs-fav-toast{',
      'position:fixed;bottom:90px;right:24px;z-index:9500;',
      'background:var(--bg2);border:1px solid rgba(57,255,20,0.2);',
      'border-radius:10px;padding:12px 18px;',
      'font-size:0.8rem;font-weight:600;color:var(--white);',
      'box-shadow:0 8px 24px rgba(0,0,0,0.5);',
      'opacity:0;transform:translateY(8px);',
      'transition:opacity 0.25s,transform 0.25s;',
      'pointer-events:none',
    '}',
    '#fs-fav-toast.show{opacity:1;transform:none}',
  ].join('');
  document.head.appendChild(style);

  // ── Toast singleton ────────────────────────────────────────
  var toastEl = document.createElement('div');
  toastEl.id = 'fs-fav-toast';
  document.body.appendChild(toastEl);
  var toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('show'); }, 2500);
  }

  // ── Cache local de favoritos del usuario ───────────────────
  var favCache = {};   // { itemId: true }
  var currentUid = null;

  // ── Referencia a colección de favoritos ────────────────────
  function favColRef(uid) {
    return window.FS_DB.collection('favoritos').doc(uid).collection('items');
  }

  // ── Cargar favoritos del usuario y actualizar UI ───────────
  function loadFavorites(uid) {
    favColRef(uid).get().then(function (snap) {
      favCache = {};
      snap.forEach(function (doc) { favCache[doc.id] = true; });
      updateAllButtons();
    }).catch(function (e) { console.warn('[Favoritos] Error cargando:', e); });
  }

  // ── Actualizar estado visual de todos los botones ──────────
  function updateAllButtons() {
    document.querySelectorAll('[data-fav-id]').forEach(function (btn) {
      var id = btn.dataset.favId;
      btn.classList.toggle('active', !!favCache[id]);
      btn.setAttribute('aria-label', favCache[id] ? 'Quitar de favoritos' : 'Agregar a favoritos');
      btn.textContent = favCache[id] ? '❤️' : '🤍';
    });
  }

  // ── Toggle favorito ────────────────────────────────────────
  function toggleFavorite(btn) {
    if (!currentUid) {
      showToast('Inicia sesión para guardar favoritos 😉');
      if (window.FSAuth) window.FSAuth.openModal('login');
      return;
    }

    var itemId = btn.dataset.favId;
    var ref    = favColRef(currentUid).doc(itemId);

    if (favCache[itemId]) {
      // Quitar
      ref.delete().then(function () {
        delete favCache[itemId];
        updateAllButtons();
        (window.FSToast ? window.FSToast('❌ Eliminado de favoritos', 'error') : null);
      }).catch(function (e) { console.warn('[Favoritos] Error al eliminar:', e); });
    } else {
      // Agregar
      var card   = btn.closest('.pc2');
      var nombre = card ? (card.querySelector('.pc2-name') || {}).textContent  || '' : '';
      var precio = card ? (card.querySelector('.pc2-price')|| {}).textContent  || '' : '';
      var tipo   = card ? (card.querySelector('.pc2-tag')  || {}).dataset.tipo || '' : '';

      ref.set({
        nombre       : nombre.trim(),
        precio       : precio.replace(/[^0-9]/g, '') * 1 || 0,
        tipo         : tipo,
        fechaAgregado: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(function () {
        favCache[itemId] = true;
        updateAllButtons();
        // Sumar 2.5 pts con límite de 10 favoritos/día
        sumarPuntosFavorito(currentUid);
        (window.FSToast ? window.FSToast('❤️ +2.5 FuchiPoints', 'success') : null);
      }).catch(function (e) { console.warn('[Favoritos] Error al guardar:', e); });
    }
  }

  // ── Inyectar botón en cada .pc2 ────────────────────────────
  function injectFavButtons() {
    document.querySelectorAll('.pc2').forEach(function (card, index) {
      // Evitar duplicados
      if (card.querySelector('.fs-fav-btn')) return;

      // Generar ID estable desde el nombre del jersey
      var nameEl = card.querySelector('.pc2-name');
      var rawId  = nameEl ? nameEl.textContent.trim().toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-]/g, '') : ('item-' + index);
      var itemId = rawId || ('item-' + index);

      var btn = document.createElement('button');
      btn.className       = 'fs-fav-btn';
      btn.dataset.favId   = itemId;
      btn.textContent     = '🤍';
      btn.setAttribute('aria-label', 'Agregar a favoritos');

      // El contenedor .pc2-img tiene position:relative, perfecto para el botón absoluto
      var imgEl = card.querySelector('.pc2-img');
      if (imgEl) {
        // Mover el badge existente a la izquierda si ocupa la derecha
        var hotBadge = imgEl.querySelector('.pc2-hot');
        if (hotBadge) hotBadge.style.right = '52px';
        imgEl.appendChild(btn);
      }

      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(btn);
      });
    });

    updateAllButtons();
  }

  // ── Observer de sesión ─────────────────────────────────────
  window.FS_AUTH.onAuthStateChanged(function (user) {
    if (user) {
      currentUid = user.uid;
      loadFavorites(user.uid);
    } else {
      currentUid = null;
      favCache   = {};
      updateAllButtons();
    }
  });

  // ── Esperar a que los productos estén en el DOM ────────────
  // Las tarjetas pueden generarse dinámicamente (filtros, búsqueda)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectFavButtons);
  } else {
    injectFavButtons();
  }

  // MutationObserver para tarjetas añadidas dinámicamente
  var observer = new MutationObserver(function (mutations) {
    var changed = mutations.some(function (m) {
      return Array.from(m.addedNodes).some(function (n) {
        return n.nodeType === 1 && (n.classList.contains('pc2') || n.querySelector && n.querySelector('.pc2'));
      });
    });
    if (changed) injectFavButtons();
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // ── Sumar puntos por favorito (anti-farm: máx 10/día) ─────
  function sumarPuntosFavorito(uid) {
    if (!uid || !window.FSRewards) return;
    var hoy = new Date().toISOString().slice(0, 10);
    var ref = window.FS_DB.collection('usuarios').doc(uid);
    ref.get().then(function(snap) {
      if (!snap.exists) return;
      var data = snap.data();
      var favHoy = data.favPtsHoy || { fecha: '', count: 0 };
      if (favHoy.fecha === hoy && favHoy.count >= 10) return; // límite diario
      var nuevoCount = favHoy.fecha === hoy ? favHoy.count + 1 : 1;
      window.FSRewards.sumarPuntos(uid, 2.5, function(res) {
        ref.update({ favPtsHoy: { fecha: hoy, count: nuevoCount } });
        if (res && res.subioNivel) showToast('🎉 Subiste a ' + res.nivelNuevo + '!');
      });
    });
  }

  // ── API pública ────────────────────────────────────────────
  window.FSFavorites = {
    reload: function () { if (currentUid) loadFavorites(currentUid); },
    getCache: function () { return Object.assign({}, favCache); },
  };

})();

