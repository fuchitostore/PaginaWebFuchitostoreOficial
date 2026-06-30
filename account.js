// ══════════════════════════════════════════════════════════════
//  account.js  —  FuchitoStore
//  Página Mi Cuenta: perfil, caja diaria, colección, recompensas
//  Depende de: firebase-config.js, auth.js, rewards.js
// ══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  if (window.location.pathname.indexOf('account') === -1) return;

  function el(id) { return document.getElementById(id); }
  function setText(id, val) { var n = el(id); if (n) n.textContent = val; }
  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  var redirectTimer = setTimeout(function() {
    if (!window.FS_AUTH.currentUser) window.location.href = 'index.html';
  }, 2000);

  window.FS_AUTH.onAuthStateChanged(function(user) {
    clearTimeout(redirectTimer);
    if (!user) { window.location.href = 'index.html'; return; }

    el('acc-loading').style.display = 'none';
    el('acc-content').style.display = '';

    cargarPerfil(user);
    cargarColeccion(user.uid);
    cargarRecompensas(user.uid);
    cargarFavoritos(user.uid);
    bindAvatarUpload(user);
  });

  // ── AVATAR ─────────────────────────────────────────────────
  var PRESET_AVATARS = [
    { id:'futbol',   emoji:'⚽', bg:'linear-gradient(135deg,#39FF14,#00a8ff)' },
    { id:'leon',     emoji:'🦁', bg:'linear-gradient(135deg,#FFB700,#FF7A00)' },
    { id:'aguila',   emoji:'🦅', bg:'linear-gradient(135deg,#00d4ff,#0066ff)' },
    { id:'fuego',    emoji:'🔥', bg:'linear-gradient(135deg,#FF3B3B,#FFB700)' },
    { id:'estrella', emoji:'⭐', bg:'linear-gradient(135deg,#FFD700,#FF8C00)' },
    { id:'rayo',     emoji:'⚡', bg:'linear-gradient(135deg,#39FF14,#FFD700)' },
    { id:'corona',   emoji:'👑', bg:'linear-gradient(135deg,#FFB700,#9C27B0)' },
    { id:'escudo',   emoji:'🛡️', bg:'linear-gradient(135deg,#00a8ff,#39FF14)' },
    { id:'dragon',   emoji:'🐉', bg:'linear-gradient(135deg,#9C27B0,#FF3B3B)' },
    { id:'medalla',  emoji:'🥇', bg:'linear-gradient(135deg,#FFD700,#FFB700)' },
    { id:'diana',    emoji:'🎯', bg:'linear-gradient(135deg,#FF3B3B,#9C27B0)' },
    { id:'tigre',    emoji:'🐯', bg:'linear-gradient(135deg,#FF7A00,#FFD700)' }
  ];

  function findPreset(id) {
    for (var i = 0; i < PRESET_AVATARS.length; i++) {
      if (PRESET_AVATARS[i].id === id) return PRESET_AVATARS[i];
    }
    return null;
  }

  // Pinta el avatar segun lo que haya: foto subida > avatar prediseñado > foto de Google > inicial
  function renderAvatar(data, user, nombre) {
    var avatarEl = el('acc-avatar');
    if (!avatarEl) return;
    var spinner = el('acc-avatar-spinner');
    var preset  = data && data.avatarPreset ? findPreset(data.avatarPreset) : null;

    if (data && data.fotoPerfil) {
      avatarEl.style.background = '';
      avatarEl.innerHTML = '<img src="'+data.fotoPerfil+'" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    } else if (preset) {
      avatarEl.style.background = preset.bg;
      avatarEl.innerHTML = '<span style="font-size:2rem;line-height:1">'+preset.emoji+'</span>';
    } else if (user && user.photoURL) {
      avatarEl.style.background = '';
      avatarEl.innerHTML = '<img src="'+user.photoURL+'" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%">';
    } else {
      avatarEl.style.background = '';
      avatarEl.innerHTML = escHtml((nombre || 'U').charAt(0).toUpperCase());
    }
    if (spinner) avatarEl.appendChild(spinner);
  }

  function bindAvatarUpload(user) {
    var input      = el('acc-avatar-input');
    var wrap       = el('acc-avatar');
    var editBtn    = el('acc-avatar-edit-btn');
    var modal      = el('acc-avatar-modal');
    var closeBtn   = el('acc-avatar-modal-close');
    var uploadBtn  = el('acc-upload-trigger');
    var grid       = el('acc-preset-grid');
    if (!input || input.dataset.bound) return;
    input.dataset.bound = '1';

    var MAX_LADO   = 220;   // px, lado maximo del avatar
    var CALIDAD    = 0.72;  // calidad JPEG
    var MAX_BYTES  = 700000; // limite de seguridad (~700KB en base64, Firestore permite 1MB por documento)

    function abrirModal() { if (modal) modal.classList.add('open'); }
    function cerrarModal() { if (modal) modal.classList.remove('open'); }

    if (editBtn) editBtn.onclick = abrirModal;
    if (closeBtn) closeBtn.onclick = cerrarModal;
    if (modal) modal.addEventListener('click', function (e) { if (e.target === modal) cerrarModal(); });
    if (uploadBtn) uploadBtn.onclick = function () { cerrarModal(); input.click(); };

    // Construir la cuadricula de avatares prediseñados
    if (grid) {
      grid.innerHTML = '';
      PRESET_AVATARS.forEach(function (p) {
        var btn = document.createElement('div');
        btn.className = 'acc-preset-item';
        btn.style.background = p.bg;
        btn.textContent = p.emoji;
        btn.title = 'Usar este avatar';
        btn.onclick = function () {
          window.FS_DB.collection('usuarios').doc(user.uid).set(
            { avatarPreset: p.id, fotoPerfil: null }, { merge: true }
          ).then(function () {
            renderAvatar({ avatarPreset: p.id, fotoPerfil: null }, user, null);
            cerrarModal();
          }).catch(function (e) {
            console.warn('[Account] avatar preset:', e);
            alert('No se pudo guardar el avatar. Intenta de nuevo.');
          });
        };
        grid.appendChild(btn);
      });
    }

    input.addEventListener('change', function () {
      var file = input.files && input.files[0];
      input.value = '';
      if (!file) return;

      var tiposValidos = ['image/jpeg', 'image/png', 'image/webp'];
      if (tiposValidos.indexOf(file.type) === -1) {
        alert('Formato no valido. Usa una imagen JPG, PNG o WEBP.');
        return;
      }
      var MAX_MB = 10;
      if (file.size > MAX_MB * 1024 * 1024) {
        alert('La imagen pesa demasiado. Maximo ' + MAX_MB + 'MB.');
        return;
      }

      if (wrap) wrap.classList.add('uploading');

      comprimirImagen(file, MAX_LADO, CALIDAD)
        .then(function (dataUrl) {
          if (dataUrl.length > MAX_BYTES) {
            // Reintenta con mas compresion si quedo muy pesada
            return comprimirImagen(file, 160, 0.55);
          }
          return dataUrl;
        })
        .then(function (dataUrl) {
          if (dataUrl.length > MAX_BYTES) {
            throw new Error('imagen-muy-pesada-tras-compresion');
          }
          return window.FS_DB.collection('usuarios').doc(user.uid).set(
            { fotoPerfil: dataUrl, avatarPreset: null }, { merge: true }
          ).then(function () { return dataUrl; });
        })
        .then(function (dataUrl) {
          renderAvatar({ fotoPerfil: dataUrl, avatarPreset: null }, user, null);
        })
        .catch(function (e) {
          console.warn('[Account] avatar upload:', e);
          alert('No se pudo guardar la foto. Intenta con otra imagen.');
        })
        .finally(function () {
          if (wrap) wrap.classList.remove('uploading');
        });
    });
  }

  // Redimensiona y comprime una imagen en el navegador, devuelve un data URL (base64)
  function comprimirImagen(file, maxLado, calidad) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onerror = function () { reject(new Error('no-se-pudo-leer-archivo')); };
      reader.onload = function () {
        var img = new Image();
        img.onerror = function () { reject(new Error('no-es-una-imagen-valida')); };
        img.onload = function () {
          var w = img.width, h = img.height;
          var lado = Math.min(w, h);
          // Recorte cuadrado centrado
          var sx = (w - lado) / 2, sy = (h - lado) / 2;
          var destino = Math.min(maxLado, lado);

          var canvas = document.createElement('canvas');
          canvas.width = destino;
          canvas.height = destino;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, sx, sy, lado, lado, 0, 0, destino, destino);

          resolve(canvas.toDataURL('image/jpeg', calidad));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // ── PERFIL ─────────────────────────────────────────────────
  function cargarPerfil(user) {
    window.FS_DB.collection('usuarios').doc(user.uid).get().then(function(snap) {
      var data = snap.exists ? snap.data() : {};
      var nombre  = data.nombre || user.displayName || 'Usuario';
      var puntos  = data.puntosAcumulados || 0;
      var nivel   = window.FSRewards ? window.FSRewards.calcLevel(puntos) : { emoji:'⚽', label:'Aficionado', insignia: null };
      var hoy     = new Date().toISOString().slice(0, 10);
      var cajaDisponible = data.ultimaCajaDiaria !== hoy;

      // Avatar (prioridad: foto subida por el usuario > foto de Google > inicial)
      renderAvatar(data, user, nombre);

      setText('acc-nombre', nombre + (nivel.insignia ? ' ' + nivel.insignia : ''));
      setText('acc-email', data.email || user.email || '');
      setText('acc-puntos', puntos + ' FuchiPoints');
      setText('acc-nivel', nivel.emoji + ' ' + nivel.label);
      setText('acc-caja-status', cajaDisponible ? '🎁 Disponible' : '⏰ Mañana');

      if (data.fechaRegistro && data.fechaRegistro.toDate) {
        var d = data.fechaRegistro.toDate();
        setText('acc-fecha', d.toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' }));
      }

      // Cupón pendiente
      if (data.cuponPendiente) {
        var cuponEl = el('acc-cupon');
        if (cuponEl) {
          cuponEl.style.display = '';
          cuponEl.innerHTML =
            '<span>🎟️ Tienes un cupón de <strong>' + data.cuponPendiente.descuento + '%</strong> disponible — escríbenos por WhatsApp para usarlo</span>';
        }
      }

      // Botón caja diaria
      var cajaBtn = el('acc-caja-btn');
      if (cajaBtn) {
        if (cajaDisponible) {
          cajaBtn.disabled = false;
          cajaBtn.onclick = function() {
            cajaBtn.disabled = true;
            window.FSRewards.abrirCajaDiaria(user.uid, function(res) {
              window.FSRewards.mostrarCaja(res);
              if (!res.yaAbierta) {
                setText('acc-puntos', res.puntosTotales + ' FuchiPoints');
                setText('acc-caja-status', '⏰ Mañana');
              }
            });
          };
        } else {
          cajaBtn.disabled = true;
          cajaBtn.textContent = '⏰ Vuelve mañana';
        }
      }
    }).catch(function(e) { console.warn('[Account] perfil:', e); });
  }

  // ── MI COLECCIÓN ───────────────────────────────────────────
  function cargarColeccion(uid) {
    var statsEl = el('acc-coleccion-stats');
    if (!statsEl) return;

    window.FS_DB.collection('favoritos').doc(uid).collection('items').get()
      .then(function(snap) {
        var total    = snap.size;
        var equipos  = {};
        var masVisto = null;
        var maxCount = 0;

        snap.forEach(function(doc) {
          var d = doc.data();
          var equipo = d.equipo || d.tipo || 'Otro';
          equipos[equipo] = (equipos[equipo] || 0) + 1;
          if (equipos[equipo] > maxCount) { maxCount = equipos[equipo]; masVisto = equipo; }
        });

        var numEquipos = Object.keys(equipos).length;

        // Total productos en catálogo (aproximado)
        var totalCatalogo = document.querySelectorAll('.pc2').length || 80;
        var pct = Math.min(100, Math.round((total / totalCatalogo) * 100));

        statsEl.innerHTML =
          '<div class="acc-col-stat"><span class="acc-col-icon">❤️</span><div>' +
            '<div class="acc-col-num">'+total+'</div>' +
            '<div class="acc-col-lbl">Jerseys guardados</div>' +
          '</div></div>' +
          '<div class="acc-col-stat"><span class="acc-col-icon">⚽</span><div>' +
            '<div class="acc-col-num">'+numEquipos+'</div>' +
            '<div class="acc-col-lbl">Equipos diferentes</div>' +
          '</div></div>' +
          '<div class="acc-col-stat"><span class="acc-col-icon">📊</span><div>' +
            '<div class="acc-col-num">'+pct+'%</div>' +
            '<div class="acc-col-lbl">Del catálogo explorado</div>' +
          '</div></div>' +
          (masVisto ? '<div class="acc-col-stat"><span class="acc-col-icon">🏆</span><div>' +
            '<div class="acc-col-num" style="font-size:0.9rem">'+escHtml(masVisto)+'</div>' +
            '<div class="acc-col-lbl">Tu equipo más seguido</div>' +
          '</div></div>' : '');
      }).catch(function(e) { console.warn('[Account] colección:', e); });
  }

  // ── RECOMPENSAS / NIVELES ──────────────────────────────────
  function cargarRecompensas(uid) {
    var panelEl = el('acc-rewards-panel');
    if (!panelEl || !window.FSRewards) return;

    window.FS_DB.collection('usuarios').doc(uid).get().then(function(snap) {
      var data    = snap.exists ? snap.data() : {};
      var puntos  = data.puntosAcumulados || 0;
      var level   = window.FSRewards.calcLevel(puntos);
      var pct     = window.FSRewards.calcProgress(puntos);
      var LEVELS  = window.FSRewards.LEVELS;
      var idx     = LEVELS.indexOf(level);
      var nextLvl = LEVELS[idx + 1];

      panelEl.innerHTML =
        '<div class="acc-level-badge">' +
          '<span class="acc-level-emoji">'+level.emoji+'</span>' +
          '<div>' +
            '<div class="acc-level-name">'+level.label+'</div>' +
            '<div class="acc-level-pts">'+puntos+' FuchiPoints</div>' +
          '</div>' +
        '</div>' +
        '<div class="acc-progress-wrap">' +
          '<div class="acc-progress-label">' +
            (nextLvl
              ? 'Hacia <strong>'+nextLvl.label+'</strong> — necesitas <strong>'+nextLvl.min+' pts</strong> ('+pct+'%)'
              : '👑 ¡Has alcanzado el nivel máximo!') +
          '</div>' +
          '<div class="acc-progress-track"><div class="acc-progress-fill" style="width:'+pct+'%"></div></div>' +
        '</div>' +
        '<div class="acc-beneficios">' +
          '<div class="acc-ben-title">Tus beneficios actuales</div>' +
          level.beneficios.map(function(b) { return '<div class="acc-ben-item">✔ '+escHtml(b)+'</div>'; }).join('') +
        '</div>' +
        '<div class="acc-levels-table">' +
          LEVELS.map(function(lv) {
            var active = lv.id === level.id;
            var bloq   = puntos < lv.min;
            return '<div class="acc-lv-row'+(active?' current':'')+(bloq?' locked':'')+'">'+
              '<span class="acc-lv-emoji">'+(bloq?'🔒':lv.emoji)+'</span>'+
              '<div class="acc-lv-info">'+
                '<div class="acc-lv-name">'+lv.label+'</div>'+
                '<div class="acc-lv-cond">'+lv.min+(lv.max===Infinity?'+':'–'+lv.max)+' FuchiPoints</div>'+
              '</div>'+
              '<div class="acc-lv-bens">'+
                lv.beneficios.slice(0,2).map(function(b){ return '<span>'+escHtml(b)+'</span>'; }).join('') +
              '</div>'+
            '</div>';
          }).join('') +
        '</div>';
    }).catch(function(e) { console.warn('[Account] recompensas:', e); });
  }

  // ── FAVORITOS ──────────────────────────────────────────────
  function cargarFavoritos(uid) {
    var listEl  = el('acc-favs-list');
    var emptyEl = el('acc-favs-empty');
    if (!listEl) return;

    window.FS_DB.collection('favoritos').doc(uid).collection('items')
      .orderBy('fechaAgregado', 'desc').get()
      .then(function(snap) {
        if (snap.empty) { if (emptyEl) emptyEl.style.display = ''; return; }
        if (emptyEl) emptyEl.style.display = 'none';

        snap.forEach(function(doc) {
          var d    = doc.data();
          var card = document.createElement('div');
          card.className = 'acc-fav-card';
          card.innerHTML =
            '<div class="acc-fav-info">' +
              '<div class="acc-fav-name">'+escHtml(d.nombre||doc.id)+'</div>' +
              '<div class="acc-fav-price">'+(d.precio?'$'+d.precio+' MXN':'')+'</div>' +
            '</div>' +
            '<button class="acc-fav-remove" data-id="'+doc.id+'">✕</button>';
          listEl.appendChild(card);
        });

        listEl.addEventListener('click', function(e) {
          var btn = e.target.closest('.acc-fav-remove');
          if (!btn) return;
          window.FS_DB.collection('favoritos').doc(uid).collection('items').doc(btn.dataset.id)
            .delete().then(function() {
              var card = btn.closest('.acc-fav-card');
              if (card) card.remove();
              if (!listEl.querySelector('.acc-fav-card') && emptyEl) emptyEl.style.display = '';
            });
        });
      }).catch(function(e) { console.warn('[Account] favoritos:', e); });
  }

})();
