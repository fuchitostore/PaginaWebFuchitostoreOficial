// ══════════════════════════════════════════════════════════════
//  rewards.js  —  FuchitoStore
//  Sistema FuchiPoints: niveles, caja diaria, banner nav
//  Depende de: firebase-config.js, auth.js
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ── CONFIGURACIÓN DE NIVELES ───────────────────────────────
  var LEVELS = [
    {
      id: 'aficionado', emoji: '⚽', label: 'Aficionado', min: 0, max: 798,
      beneficios: ['Acceso al sistema de FuchiPoints', 'Caja diaria básica'],
      insignia: null
    },
    {
      id: 'hincha', emoji: '🔥', label: 'Hincha', min: 799, max: 2498,
      beneficios: ['Mayor probabilidad en caja diaria', 'Acceso a votaciones exclusivas'],
      insignia: '🔥'
    },
    {
      id: 'coleccionista', emoji: '🏆', label: 'Coleccionista', min: 2499, max: 4999,
      beneficios: ['Acceso anticipado a nuevos catálogos', 'Insignia especial en perfil', 'Cupón único 5% al alcanzar este nivel'],
      insignia: '🏆'
    },
    {
      id: 'leyenda', emoji: '👑', label: 'Leyenda Fuchito', min: 5000, max: Infinity,
      beneficios: ['Prioridad en preventas', 'Insignia exclusiva', 'Cupón único 10% al alcanzar este nivel', 'Probabilidad especial en caja diaria'],
      insignia: '👑'
    }
  ];

  // ── CAJA DIARIA: tabla de recompensas por nivel ────────────
  var CAJA_CONFIG = {
    aficionado: [
      { tipo: 'puntos', valor: 5,  peso: 60, label: '+5 FuchiPoints'  },
      { tipo: 'puntos', valor: 10, peso: 40, label: '+10 FuchiPoints' }
    ],
    hincha: [
      { tipo: 'puntos', valor: 10, peso: 50, label: '+10 FuchiPoints' },
      { tipo: 'puntos', valor: 20, peso: 40, label: '+20 FuchiPoints' },
      { tipo: 'puntos', valor: 30, peso: 10, label: '+30 FuchiPoints' }
    ],
    coleccionista: [
      { tipo: 'puntos', valor: 20, peso: 55, label: '+20 FuchiPoints' },
      { tipo: 'puntos', valor: 35, peso: 35, label: '+35 FuchiPoints' },
      { tipo: 'cupon',  valor: 5,  peso: 10, label: '🎁 Cupón 5% sorpresa' }
    ],
    leyenda: [
      { tipo: 'puntos', valor: 30, peso: 55, label: '+30 FuchiPoints' },
      { tipo: 'puntos', valor: 50, peso: 35, label: '+50 FuchiPoints' },
      { tipo: 'cupon',  valor: 10, peso: 10, label: '👑 Cupón 10% exclusivo' }
    ]
  };

  // ── ACCIONES QUE DAN PUNTOS ────────────────────────────────
  var ACCIONES = {
    registro         : 50,
    loginDiario      : 5,
    cajaDiaria       : 0,   // varía por nivel
    completarPerfil  : 30,
    explorarProducto : 1,   // máx 10/día
    agregarColeccion : 3,
    compra           : 100
  };

  // ── HELPERS ────────────────────────────────────────────────
  function calcLevel(puntos) {
    for (var i = LEVELS.length - 1; i >= 0; i--) {
      if (puntos >= LEVELS[i].min) return LEVELS[i];
    }
    return LEVELS[0];
  }

  function calcProgress(puntos) {
    var current = calcLevel(puntos);
    var idx = LEVELS.indexOf(current);
    if (idx === LEVELS.length - 1) return 100;
    var next  = LEVELS[idx + 1];
    var range = next.min - current.min;
    var done  = puntos - current.min;
    return Math.min(100, Math.round((done / range) * 100));
  }

  function weightedRandom(items) {
    var total = items.reduce(function(s, i) { return s + i.peso; }, 0);
    var r = Math.random() * total;
    for (var i = 0; i < items.length; i++) {
      r -= items[i].peso;
      if (r <= 0) return items[i];
    }
    return items[items.length - 1];
  }

  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  // ── SUMAR PUNTOS EN FIRESTORE ──────────────────────────────
  function sumarPuntos(uid, cantidad, callback) {
    var ref = window.FS_DB.collection('usuarios').doc(uid);
    ref.get().then(function(snap) {
      if (!snap.exists) return;
      var data      = snap.data();
      var nuevos    = (data.puntosAcumulados || 0) + cantidad;
      var nivelAntes = data.nivel || 'aficionado';
      var nivelNuevo = calcLevel(nuevos).id;
      var update     = { puntosAcumulados: nuevos, nivel: nivelNuevo };

      // Cupón de subida de nivel (solo una vez)
      if (nivelAntes !== nivelNuevo) {
        if (nivelNuevo === 'coleccionista' && !data.cuponColeccionistaDado) {
          update.cuponColeccionistaDado = true;
          update.cuponPendiente = { descuento: 5, nivel: 'coleccionista' };
        }
        if (nivelNuevo === 'leyenda' && !data.cuponLeyendaDado) {
          update.cuponLeyendaDado = true;
          update.cuponPendiente   = { descuento: 10, nivel: 'leyenda' };
        }
      }

      return ref.update(update).then(function() {
        if (callback) callback({ puntos: nuevos, nivelAntes: nivelAntes, nivelNuevo: nivelNuevo, subioNivel: nivelAntes !== nivelNuevo });
      });
    }).catch(function(e) { console.warn('[Rewards] sumarPuntos:', e); });
  }

  // ── CAJA DIARIA ────────────────────────────────────────────
  function abrirCajaDiaria(uid, callback) {
    var ref = window.FS_DB.collection('usuarios').doc(uid);
    ref.get().then(function(snap) {
      if (!snap.exists) return;
      var data  = snap.data();
      var hoy   = todayStr();
      var nivel = data.nivel || 'aficionado';

      if (data.ultimaCajaDiaria === hoy) {
        if (callback) callback({ yaAbierta: true });
        return;
      }

      var tabla     = CAJA_CONFIG[nivel] || CAJA_CONFIG.aficionado;
      var resultado = weightedRandom(tabla);

      var update = { ultimaCajaDiaria: hoy };

      if (resultado.tipo === 'puntos') {
        var nuevos = (data.puntosAcumulados || 0) + resultado.valor;
        var nivelNuevo = calcLevel(nuevos).id;
        update.puntosAcumulados = nuevos;
        update.nivel = nivelNuevo;
        ref.update(update).then(function() {
          if (callback) callback({ yaAbierta: false, resultado: resultado, puntosTotales: nuevos });
        });
      } else {
        // cupón sorpresa
        update.cuponPendiente = { descuento: resultado.valor, origen: 'cajaDiaria' };
        ref.update(update).then(function() {
          if (callback) callback({ yaAbierta: false, resultado: resultado, puntosTotales: data.puntosAcumulados || 0 });
        });
      }
    }).catch(function(e) { console.warn('[Rewards] cajaDiaria:', e); });
  }

  // ── LOGIN DIARIO (sumar 5 pts si no lo hizo hoy) ──────────
  function registrarLoginDiario(uid) {
    var ref = window.FS_DB.collection('usuarios').doc(uid);
    ref.get().then(function(snap) {
      if (!snap.exists) return;
      var data = snap.data();
      var hoy  = todayStr();
      if (data.ultimoLoginDiario === hoy) return;
      sumarPuntos(uid, ACCIONES.loginDiario, null);
      ref.update({ ultimoLoginDiario: hoy });
    });
  }

  // ── ESTILOS DEL BANNER NAV ─────────────────────────────────
  var style = document.createElement('style');
  style.textContent = [
    '#fs-rewards-banner{display:none;align-items:center;gap:8px;',
      'background:rgba(57,255,20,0.06);border:1px solid rgba(57,255,20,0.15);',
      'border-radius:8px;padding:7px 14px;font-size:0.74rem;font-weight:600;',
      'color:rgba(255,255,255,0.75)}',
    '#fs-rewards-banner.visible{display:flex}',
    '.fs-rew-progress-wrap{width:60px;height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden}',
    '.fs-rew-progress-bar{height:100%;background:var(--neon);border-radius:2px;transition:width 0.6s ease}',
    '.fs-rew-pts{font-size:0.65rem;color:var(--neon);font-weight:700}',

    // Modal caja diaria
    '#fs-caja-overlay{display:none;position:fixed;inset:0;z-index:9100;',
      'background:rgba(9,9,15,0.9);backdrop-filter:blur(12px);',
      'align-items:center;justify-content:center}',
    '#fs-caja-overlay.open{display:flex}',
    '#fs-caja-modal{background:var(--bg2);border:1px solid rgba(57,255,20,0.2);',
      'border-radius:20px;padding:48px 40px;max-width:380px;width:100%;',
      'text-align:center;box-shadow:0 0 80px rgba(57,255,20,0.08)}',
    '.fs-caja-icon{font-size:4rem;margin-bottom:16px;display:block;',
      'animation:fs-bounce 0.6s ease}',
    '@keyframes fs-bounce{0%{transform:scale(0.5);opacity:0}',
      '70%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}',
    '.fs-caja-title{font-family:"Bebas Neue",sans-serif;font-size:1.8rem;',
      'letter-spacing:2px;color:var(--neon);margin-bottom:8px}',
    '.fs-caja-result{font-size:1.1rem;font-weight:700;margin:16px 0;color:var(--white)}',
    '.fs-caja-sub{font-size:0.78rem;color:var(--muted);margin-bottom:24px}',
    '.fs-caja-close{background:var(--neon);color:var(--bg);border:none;',
      'padding:12px 32px;border-radius:8px;font-weight:700;font-size:0.85rem;cursor:pointer}',
    '.fs-caja-ya{font-size:0.85rem;color:var(--muted);margin-bottom:24px}',
  ].join('');
  document.head.appendChild(style);

  // ── BANNER EN NAV ──────────────────────────────────────────
  var navWrapper = document.getElementById('fs-nav-btn') &&
                   document.getElementById('fs-nav-btn').parentNode;
  var banner = document.createElement('div');
  banner.id = 'fs-rewards-banner';
  banner.innerHTML =
    '<span id="fs-rew-emoji">⚽</span>' +
    '<span id="fs-rew-label">Aficionado</span>' +
    '<span class="fs-rew-pts" id="fs-rew-pts">0 pts</span>' +
    '<div class="fs-rew-progress-wrap"><div class="fs-rew-progress-bar" id="fs-rew-bar" style="width:0%"></div></div>';
  if (navWrapper && navWrapper.parentNode) {
    navWrapper.parentNode.insertBefore(banner, navWrapper);
  }

  // ── MODAL CAJA DIARIA ──────────────────────────────────────
  var cajaOverlay = document.createElement('div');
  cajaOverlay.id = 'fs-caja-overlay';
  cajaOverlay.innerHTML =
    '<div id="fs-caja-modal">' +
      '<span class="fs-caja-icon" id="fs-caja-icon">🎁</span>' +
      '<div class="fs-caja-title">Caja Diaria</div>' +
      '<div class="fs-caja-result" id="fs-caja-result"></div>' +
      '<div class="fs-caja-sub" id="fs-caja-sub"></div>' +
      '<button class="fs-caja-close" id="fs-caja-close">¡Genial!</button>' +
    '</div>';
  document.body.appendChild(cajaOverlay);

  document.getElementById('fs-caja-close').addEventListener('click', function() {
    cajaOverlay.classList.remove('open');
  });

  function mostrarResultadoCaja(res) {
    cajaOverlay.classList.add('open');
    var iconEl   = document.getElementById('fs-caja-icon');
    var resultEl = document.getElementById('fs-caja-result');
    var subEl    = document.getElementById('fs-caja-sub');

    if (res.yaAbierta) {
      iconEl.textContent   = '⏰';
      resultEl.textContent = 'Ya abriste tu caja hoy';
      subEl.textContent    = 'Vuelve mañana para tu próxima recompensa';
    } else {
      var r = res.resultado;
      iconEl.textContent   = r.tipo === 'cupon' ? '🎟️' : '⭐';
      resultEl.textContent = r.label;
      subEl.textContent    = 'Total acumulado: ' + res.puntosTotales + ' FuchiPoints';
      // Actualizar banner
      actualizarBanner(res.puntosTotales);
    }
  }

  // ── ACTUALIZAR BANNER ──────────────────────────────────────
  function actualizarBanner(puntos) {
    var level = calcLevel(puntos);
    var pct   = calcProgress(puntos);
    var emojiEl = document.getElementById('fs-rew-emoji');
    var labelEl = document.getElementById('fs-rew-label');
    var ptsEl   = document.getElementById('fs-rew-pts');
    var barEl   = document.getElementById('fs-rew-bar');
    if (emojiEl) emojiEl.textContent = level.emoji;
    if (labelEl) labelEl.textContent = level.label;
    if (ptsEl)   ptsEl.textContent   = puntos + ' pts';
    setTimeout(function() { if (barEl) barEl.style.width = pct + '%'; }, 50);
    banner.classList.add('visible');
  }

  // ── OBSERVER DE SESIÓN ─────────────────────────────────────
  window.FS_AUTH.onAuthStateChanged(function(user) {
    if (user) {
      window.FS_DB.collection('usuarios').doc(user.uid).get().then(function(snap) {
        if (snap.exists) {
          var data = snap.data();
          actualizarBanner(data.puntosAcumulados || 0);
          registrarLoginDiario(user.uid);
        }
      });
    } else {
      banner.classList.remove('visible');
    }
  });

  // ── API PÚBLICA ────────────────────────────────────────────
  window.FSRewards = {
    LEVELS         : LEVELS,
    ACCIONES       : ACCIONES,
    calcLevel      : calcLevel,
    calcProgress   : calcProgress,
    sumarPuntos    : sumarPuntos,
    abrirCajaDiaria: abrirCajaDiaria,
    mostrarCaja    : mostrarResultadoCaja,
    actualizarBanner: actualizarBanner,
  };

})();
