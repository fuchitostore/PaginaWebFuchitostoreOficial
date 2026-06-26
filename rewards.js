// ══════════════════════════════════════════════════════════════
//  rewards.js  —  FuchitoStore
//  Cálculo de niveles, barra de progreso, banner en nav
//  Depende de: firebase-config.js, auth.js
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── Tabla de niveles ───────────────────────────────────────
  var LEVELS = [
    { id: 'aficionado',   emoji: '⚽', label: 'Aficionado',    min: 0,  max: 1,  beneficio: 'Acceso base' },
    { id: 'hincha',       emoji: '🔥', label: 'Hincha',        min: 2,  max: 4,  beneficio: '5% descuento' },
    { id: 'coleccionista',emoji: '🏆', label: 'Coleccionista', min: 5,  max: 9,  beneficio: '10% + envío gratis' },
    { id: 'leyenda',      emoji: '👑', label: 'Leyenda Fuchito',min:10, max:Infinity, beneficio: '15% + acceso preventa' },
  ];

  // ── Calcular nivel según número de compras ─────────────────
  function calcLevel(totalCompras) {
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (totalCompras >= LEVELS[i].min) return LEVELS[i];
    }
    return LEVELS[0];
  }

  // ── Progreso hacia el siguiente nivel (0-100) ──────────────
  function calcProgress(totalCompras) {
    var current = calcLevel(totalCompras);
    var idx     = LEVELS.indexOf(current);
    if (idx === LEVELS.length - 1) return 100; // ya es Leyenda
    var next    = LEVELS[idx + 1];
    var range   = next.min - current.min;
    var done    = totalCompras - current.min;
    return Math.min(100, Math.round((done / range) * 100));
  }

  // ── Estilos: banner nav ────────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#fs-rewards-banner{',
      'display:none;align-items:center;gap:10px;',
      'background:rgba(57,255,20,0.06);',
      'border:1px solid rgba(57,255,20,0.15);',
      'border-radius:8px;padding:8px 16px;',
      'font-size:0.75rem;font-weight:600;',
      'color:rgba(255,255,255,0.75)',
    '}',
    '#fs-rewards-banner.visible{display:flex}',
    '.fs-rew-emoji{font-size:1rem}',
    '.fs-rew-progress-wrap{',
      'width:70px;height:4px;background:rgba(255,255,255,0.1);',
      'border-radius:2px;overflow:hidden',
    '}',
    '.fs-rew-progress-bar{',
      'height:100%;background:var(--neon);',
      'border-radius:2px;transition:width 0.6s ease',
    '}',
    '.fs-rew-pct{font-size:0.65rem;color:var(--muted)}',
  ].join('');
  document.head.appendChild(style);

  // ── Inyectar banner en la nav (izquierda del botón de cuenta) ──
  var navWrapper = document.getElementById('fs-nav-btn') &&
                   document.getElementById('fs-nav-btn').parentNode;
  var banner = document.createElement('div');
  banner.id = 'fs-rewards-banner';
  banner.innerHTML =
    '<span class="fs-rew-emoji" id="fs-rew-emoji">⚽</span>' +
    '<span id="fs-rew-label">Aficionado</span>' +
    '<div class="fs-rew-progress-wrap">' +
      '<div class="fs-rew-progress-bar" id="fs-rew-bar" style="width:0%"></div>' +
    '</div>' +
    '<span class="fs-rew-pct" id="fs-rew-pct">0%</span>';

  if (navWrapper && navWrapper.parentNode) {
    navWrapper.parentNode.insertBefore(banner, navWrapper);
  } else {
    var nav = document.querySelector('nav');
    if (nav) nav.appendChild(banner);
  }

  // ── Actualizar banner ──────────────────────────────────────
  function updateBanner(data) {
    var compras = data.totalCompras || 0;
    var level   = calcLevel(compras);
    var pct     = calcProgress(compras);

    document.getElementById('fs-rew-emoji').textContent = level.emoji;
    document.getElementById('fs-rew-label').textContent = level.label;
    document.getElementById('fs-rew-pct').textContent   = pct + '%';

    var bar = document.getElementById('fs-rew-bar');
    // Dar un tick para que la transición CSS funcione
    setTimeout(function () { if (bar) bar.style.width = pct + '%'; }, 50);

    banner.classList.add('visible');
  }

  // ── Actualizar nivel en Firestore si cambió ────────────────
  function syncLevelToFirestore(uid, totalCompras) {
    var level = calcLevel(totalCompras);
    window.FS_DB.collection('usuarios').doc(uid).update({
      nivel: level.id,
    }).catch(function () {});
  }

  // ── Observer de sesión ─────────────────────────────────────
  window.FS_AUTH.onAuthStateChanged(function (user) {
    if (user) {
      window.FS_DB.collection('usuarios').doc(user.uid).get()
        .then(function (snap) {
          if (snap.exists) {
            var data = snap.data();
            updateBanner(data);
            syncLevelToFirestore(user.uid, data.totalCompras || 0);
          }
        })
        .catch(function (e) { console.warn('[Rewards]', e); });
    } else {
      banner.classList.remove('visible');
    }
  });

  // ── API pública ────────────────────────────────────────────
  // Útil para account.js: window.FSRewards.calcLevel(5) → objeto nivel
  window.FSRewards = {
    LEVELS       : LEVELS,
    calcLevel    : calcLevel,
    calcProgress : calcProgress,
  };

})();
