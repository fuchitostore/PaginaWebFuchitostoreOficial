// ══════════════════════════════════════════════════════════════
//  account.js  —  FuchitoStore
//  Lógica de account.html: perfil, favoritos listados, nivel
//  Depende de: firebase-config.js, auth.js, rewards.js
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Guard: solo correr en account.html ────────────────────
  if (window.location.pathname.indexOf('account') === -1) return;

  // ── Elementos ──────────────────────────────────────────────
  function el(id) { return document.getElementById(id); }

  // ── Redirigir si no hay sesión (espera 1.5 s) ─────────────
  var redirectTimer = setTimeout(function () {
    if (!window.FS_AUTH.currentUser) {
      window.location.href = 'index.html';
    }
  }, 1500);

  // ── Observer principal ─────────────────────────────────────
  window.FS_AUTH.onAuthStateChanged(function (user) {
    clearTimeout(redirectTimer);

    if (!user) {
      window.location.href = 'index.html';
      return;
    }

    loadProfile(user);
    loadFavoritesList(user.uid);
    loadRewardsPanel(user.uid);
  });

  // ── PERFIL ─────────────────────────────────────────────────
  function loadProfile(user) {
    window.FS_DB.collection('usuarios').doc(user.uid).get()
      .then(function (snap) {
        var data = snap.exists ? snap.data() : {};
        var nombre = data.nombre || user.displayName || 'Usuario';
        var email  = data.email  || user.email  || '';
        var compras = data.totalCompras    || 0;
        var puntos  = data.puntosAcumulados|| 0;

        setText('acc-nombre',  nombre);
        setText('acc-email',   email);
        setText('acc-compras', compras);
        setText('acc-puntos',  puntos);

        var avatarEl = el('acc-avatar');
        if (avatarEl) {
          if (user.photoURL) {
            avatarEl.innerHTML = '<img src="' + user.photoURL + '" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
          } else {
            avatarEl.textContent = nombre.charAt(0).toUpperCase();
          }
        }

        // Fecha de registro
        if (data.fechaRegistro && data.fechaRegistro.toDate) {
          var d = data.fechaRegistro.toDate();
          setText('acc-fecha', d.toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' }));
        }
      })
      .catch(function (e) { console.warn('[Account] Perfil:', e); });
  }

  // ── FAVORITOS ──────────────────────────────────────────────
  function loadFavoritesList(uid) {
    var container = el('acc-favs-list');
    var empty     = el('acc-favs-empty');
    if (!container) return;

    window.FS_DB.collection('favoritos').doc(uid).collection('items')
      .orderBy('fechaAgregado', 'desc')
      .get()
      .then(function (snap) {
        if (snap.empty) {
          if (empty) empty.style.display = '';
          return;
        }
        if (empty) empty.style.display = 'none';

        var frag = document.createDocumentFragment();
        snap.forEach(function (doc) {
          var d    = doc.data();
          var card = document.createElement('div');
          card.className = 'acc-fav-card';
          card.innerHTML =
            '<div class="acc-fav-info">' +
              '<div class="acc-fav-name">' + escHtml(d.nombre || doc.id) + '</div>' +
              '<div class="acc-fav-price">' + (d.precio ? '$' + d.precio + ' MXN' : '') + '</div>' +
            '</div>' +
            '<button class="acc-fav-remove" data-id="' + doc.id + '" title="Quitar">✕</button>';
          frag.appendChild(card);
        });
        container.appendChild(frag);

        // Botones de quitar
        container.addEventListener('click', function (e) {
          var btn = e.target.closest('.acc-fav-remove');
          if (!btn) return;
          var id = btn.dataset.id;
          window.FS_DB.collection('favoritos').doc(uid).collection('items').doc(id)
            .delete()
            .then(function () {
              var card = btn.closest('.acc-fav-card');
              if (card) card.remove();
              if (!container.querySelector('.acc-fav-card') && empty) {
                empty.style.display = '';
              }
            });
        });
      })
      .catch(function (e) { console.warn('[Account] Favoritos:', e); });
  }

  // ── RECOMPENSAS ────────────────────────────────────────────
  function loadRewardsPanel(uid) {
    var panelEl = el('acc-rewards-panel');
    if (!panelEl || !window.FSRewards) return;

    window.FS_DB.collection('usuarios').doc(uid).get()
      .then(function (snap) {
        var data    = snap.exists ? snap.data() : {};
        var compras = data.totalCompras || 0;
        var level   = window.FSRewards.calcLevel(compras);
        var pct     = window.FSRewards.calcProgress(compras);
        var LEVELS  = window.FSRewards.LEVELS;
        var idx     = LEVELS.indexOf(level);
        var nextLvl = LEVELS[idx + 1];

        panelEl.innerHTML =
          '<div class="acc-level-badge">' +
            '<span class="acc-level-emoji">' + level.emoji + '</span>' +
            '<div>' +
              '<div class="acc-level-name">' + level.label + '</div>' +
              '<div class="acc-level-benefit">' + level.beneficio + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="acc-progress-wrap">' +
            '<div class="acc-progress-label">' +
              (nextLvl
                ? 'Progreso hacia <strong>' + nextLvl.label + '</strong> (' + pct + '%)'
                : '🎉 ¡Has alcanzado el nivel máximo!') +
            '</div>' +
            '<div class="acc-progress-track">' +
              '<div class="acc-progress-fill" style="width:' + pct + '%"></div>' +
            '</div>' +
          '</div>' +
          '<div class="acc-levels-table">' +
            LEVELS.map(function (lv) {
              var active = lv.id === level.id;
              return '<div class="acc-lv-row' + (active ? ' current' : '') + '">' +
                '<span class="acc-lv-emoji">' + lv.emoji + '</span>' +
                '<span class="acc-lv-name">' + lv.label + '</span>' +
                '<span class="acc-lv-cond">' + lv.min + (lv.max === Infinity ? '+' : '–' + lv.max) + ' compras</span>' +
                '<span class="acc-lv-ben">' + lv.beneficio + '</span>' +
              '</div>';
            }).join('') +
          '</div>';
      })
      .catch(function (e) { console.warn('[Account] Rewards:', e); });
  }

  // ── Utilidades ─────────────────────────────────────────────
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

})();
