// canje.js — FuchitoStore
// Sistema de canje con recibo digital y descuento automático de puntos

(function () {
  'use strict';

  if (window.location.pathname.toLowerCase().indexOf('account') === -1) return;

  var FUCHITO_IMG = "https://fuchitostore.github.io/Fuchitostore/catalogo/fuchito-comprobante.png";

  var style = document.createElement('style');
  style.textContent = [
    '.canje-section{margin-bottom:48px}',
    '.canje-grid{display:flex;flex-direction:column;gap:10px}',
    '.canje-item{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:18px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;transition:border-color 0.2s}',
    '.canje-item:hover{border-color:rgba(57,255,20,0.2)}',
    '.canje-item.bloqueado{opacity:0.45}',
    '.canje-left{display:flex;align-items:center;gap:14px}',
    '.canje-icon{font-size:1.6rem}',
    '.canje-nombre{font-weight:700;font-size:0.88rem;margin-bottom:3px}',
    '.canje-desc{font-size:0.73rem;color:var(--muted)}',
    '.canje-pts{font-family:"Bebas Neue",sans-serif;font-size:1.1rem;color:var(--neon);white-space:nowrap}',
    '.canje-btn{background:var(--neon);color:var(--bg);font-weight:700;font-size:0.75rem;padding:9px 16px;border-radius:8px;border:none;cursor:pointer;transition:opacity 0.2s;white-space:nowrap}',
    '.canje-btn:hover{opacity:0.85}',
    '.canje-btn.locked{background:var(--bg3);color:var(--muted);cursor:not-allowed;border:1px solid var(--border)}',
    '.canje-nota{font-size:0.73rem;color:var(--muted);text-align:center;margin-top:16px;line-height:1.6}',
    '.canje-embajador{background:linear-gradient(135deg,rgba(255,183,0,0.08),rgba(57,255,20,0.05));border:1px solid rgba(255,183,0,0.3)!important;position:relative;overflow:hidden}',
    '.canje-embajador::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,183,0,0.04),transparent);pointer-events:none}',
    '.canje-embajador .canje-icon{font-size:2rem}',
    '.canje-embajador .canje-nombre{color:var(--gold)!important;font-size:0.95rem!important}',
    '.canje-embajador .canje-pts{color:var(--gold)!important;font-size:1.3rem!important}',
    '.canje-embajador .canje-btn{background:linear-gradient(135deg,var(--gold),#ffcd60);color:#000}',
    '.canje-embajador-tag{display:inline-block;background:rgba(255,183,0,0.15);border:1px solid rgba(255,183,0,0.3);border-radius:20px;padding:2px 10px;font-size:0.65rem;font-weight:700;color:var(--gold);letter-spacing:1px;margin-bottom:4px}',

    // Modal confirmación
    '#canje-overlay{display:none;position:fixed;inset:0;z-index:9500;background:rgba(9,9,15,0.92);backdrop-filter:blur(12px);align-items:center;justify-content:center;padding:20px}',
    '#canje-overlay.open{display:flex}',
    '#canje-modal{background:var(--bg2);border:1px solid rgba(57,255,20,0.2);border-radius:20px;padding:32px;max-width:420px;width:100%;text-align:center}',
    '#canje-modal h3{font-family:"Bebas Neue",sans-serif;font-size:1.6rem;letter-spacing:1px;color:var(--white);margin-bottom:8px}',
    '#canje-modal p{font-size:0.82rem;color:var(--muted);line-height:1.6;margin-bottom:24px}',
    '.canje-modal-btns{display:flex;gap:10px;justify-content:center}',
    '.btn-confirmar{background:var(--neon);color:var(--bg);font-weight:700;padding:12px 28px;border-radius:8px;border:none;cursor:pointer;font-size:0.85rem}',
    '.btn-cancelar{background:transparent;color:var(--muted);font-weight:600;padding:12px 28px;border-radius:8px;border:1px solid var(--border);cursor:pointer;font-size:0.85rem}',

    // Recibo
    '#recibo-overlay{display:none;position:fixed;inset:0;z-index:9600;background:rgba(9,9,15,0.95);backdrop-filter:blur(12px);align-items:center;justify-content:center;padding:20px;overflow-y:auto}',
    '#recibo-overlay.open{display:flex}',
    '#recibo-card{background:#fff;border-radius:16px;padding:28px 24px;max-width:360px;width:100%;text-align:center;color:#111;position:relative}',
    '#recibo-card .rec-header{background:#09090f;border-radius:10px;padding:16px;margin-bottom:16px}',
    '#recibo-card .rec-fuchito{width:140px;height:140px;object-fit:cover;border-radius:10px;margin-bottom:12px}',
    '#recibo-card .rec-title{font-family:"Bebas Neue",sans-serif;font-size:1.6rem;letter-spacing:2px;color:#39FF14;margin-bottom:2px}',
    '#recibo-card .rec-sub{font-size:0.65rem;letter-spacing:2px;color:rgba(255,255,255,0.4);text-transform:uppercase}',
    '.rec-divider{border:none;border-top:1px dashed #ddd;margin:14px 0}',
    '.rec-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;font-size:0.82rem}',
    '.rec-row .label{color:#666}',
    '.rec-row .value{font-weight:700;color:#111}',
    '.rec-codigo{background:#f5f5f5;border-radius:8px;padding:10px;margin:14px 0;font-family:monospace;font-size:1rem;font-weight:700;letter-spacing:3px;color:#111;border:1px dashed #ccc}',
    '.rec-aviso{font-size:0.68rem;color:#999;line-height:1.5;margin-top:12px}',
    '.rec-aviso strong{color:#e53935}',
    '.rec-btns{display:flex;flex-direction:column;gap:8px;margin-top:16px}',
    '.rec-btn-wa{background:#25D366;color:#fff;font-weight:700;padding:12px;border-radius:8px;border:none;cursor:pointer;font-size:0.85rem;width:100%}',
    '.rec-btn-cerrar{background:transparent;color:#999;font-size:0.78rem;border:none;cursor:pointer;padding:8px;width:100%}',

    '@media(max-width:600px){.canje-item{flex-direction:column;align-items:flex-start}.canje-btn{width:100%;text-align:center}}',
  ].join('');
  document.head.appendChild(style);

  var CANJES = [
    { icon:'⚡', nombre:'Prioridad de pedido',      desc:'Tu pedido tendrá prioridad en el proceso de preparación cuando sea posible.',                                                                                  pts:800   },
    { icon:'🎁', nombre:'Caja Premium (7 días)',    desc:'Durante 7 días tu caja diaria tendrá una ligera mejora en las probabilidades de obtener mejores recompensas. No garantiza premios especiales.',               pts:1500  },
    { icon:'🎟️', nombre:'Cupón 5%',                desc:'Obtén un cupón del 5% de descuento para utilizar en tu próxima compra. Un solo uso.',                                                                          pts:2000  },
    { icon:'🚚', nombre:'Envío gratis',             desc:'Envío gratuito en tu siguiente pedido. Solo aplica para pedidos enviados, no para entregas presenciales.',                                                     pts:2500  },
    { icon:'🎁', nombre:'Caja Misteriosa',          desc:'Abre una caja con una recompensa aleatoria. Puede contener FuchiPoints, una Caja Premium o un cupón de descuento. Cada apertura es diferente.',              pts:4000  },
    { icon:'👑', nombre:'Pase VIP (30 días)',       desc:'Durante 30 días: prioridad de pedido, caja diaria con mejora en probabilidades e insignia VIP visible en tu perfil.',                                         pts:5000  },
    { icon:'🎟️', nombre:'Cupón 10%',               desc:'Obtén un cupón del 10% de descuento para utilizar en tu próxima compra. Recompensa exclusiva de alto valor. Un solo uso.',                                    pts:8000  },
    { icon:'🏆', nombre:'Embajador Fuchito',        desc:'Un rango especial dentro de la comunidad. Obtén de forma permanente: insignia exclusiva en tu perfil, marco exclusivo, caja diaria mejorada permanente y aparición en el Muro de Embajadores.', pts:12000 },
  ];

  // Modal confirmación
  var confirmOverlay = document.createElement('div');
  confirmOverlay.id = 'canje-overlay';
  confirmOverlay.innerHTML =
    '<div id="canje-modal">' +
      '<h3>¿Estás seguro?</h3>' +
      '<p id="canje-modal-txt"></p>' +
      '<p style="font-size:0.75rem;color:rgba(255,100,100,0.8);margin-bottom:20px">⚠️ Tus puntos se descontarán al confirmar.<br>Deberás tomar foto del recibo y enviárnosla por WhatsApp.</p>' +
      '<div class="canje-modal-btns">' +
        '<button class="btn-cancelar" id="canje-btn-cancelar">Cancelar</button>' +
        '<button class="btn-confirmar" id="canje-btn-confirmar">Sí, canjear</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(confirmOverlay);

  // Recibo overlay
  var reciboOverlay = document.createElement('div');
  reciboOverlay.id = 'recibo-overlay';
  reciboOverlay.innerHTML =
    '<div id="recibo-card">' +
      '<div class="rec-header">' +
        '<img class="rec-fuchito" src="' + FUCHITO_IMG + '" alt="Fuchito">' +
        '<div class="rec-title">FuchitoStore</div>' +
        '<div class="rec-sub">Comprobante de Canje</div>' +
      '</div>' +
      '<hr class="rec-divider">' +
      '<div class="rec-row"><span class="label">Beneficio</span><span class="value" id="rec-beneficio">—</span></div>' +
      '<div class="rec-row"><span class="label">Puntos canjeados</span><span class="value" id="rec-pts">—</span></div>' +
      '<div class="rec-row"><span class="label">Fecha</span><span class="value" id="rec-fecha">—</span></div>' +
      '<div class="rec-row"><span class="label">Hora</span><span class="value" id="rec-hora">—</span></div>' +
      '<div class="rec-row"><span class="label">Usuario</span><span class="value" id="rec-usuario">—</span></div>' +
      '<hr class="rec-divider">' +
      '<div class="rec-codigo" id="rec-codigo">———</div>' +
      '<p class="rec-aviso">📸 <strong>Toma una captura de pantalla</strong> de este recibo y envíala por WhatsApp para activar tu beneficio.<br>Este código es de <strong>uso único</strong>.</p>' +
      '<div class="rec-btns">' +
        '<button class="rec-btn-wa" id="rec-btn-wa">📲 Enviar a WhatsApp</button>' +
        '<button class="rec-btn-cerrar" id="rec-btn-cerrar">Cerrar</button>' +
      '</div>' +
    '</div>';
  document.body.appendChild(reciboOverlay);

  var canjeActual = null;
  var userActual  = null;

  document.getElementById('canje-btn-cancelar').addEventListener('click', function() {
    confirmOverlay.classList.remove('open');
    canjeActual = null;
  });

  document.getElementById('canje-btn-confirmar').addEventListener('click', function() {
    if (!canjeActual || !userActual) return;
    confirmOverlay.classList.remove('open');
    ejecutarCanje(userActual, canjeActual);
  });

  document.getElementById('rec-btn-cerrar').addEventListener('click', function() {
    reciboOverlay.classList.remove('open');
  });

  function generarCodigo() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var code = 'FS-';
    for (var i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  function ejecutarCanje(user, canje) {
    var ref = window.FS_DB.collection('usuarios').doc(user.uid);
    ref.get().then(function(snap) {
      if (!snap.exists) return;
      var data   = snap.data();
      var puntos = data.puntosAcumulados || 0;

      if (puntos < canje.pts) {
        (window.FSToast ? window.FSToast('No tienes suficientes puntos', 'error') : alert('No tienes suficientes puntos'));
        return;
      }

      var nuevoPts = puntos - canje.pts;
      var codigo   = generarCodigo();
      var ahora    = new Date();

      // Descontar puntos y guardar registro del canje
      var canjeData = {
        uid       : user.uid,
        nombre    : user.displayName || user.email || 'Usuario',
        email     : user.email || '',
        codigo    : codigo,
        beneficio : canje.nombre,
        pts       : canje.pts,
        fecha     : ahora.toISOString(),
        usado     : false,
      };

      // Guardar en colección canjes + actualizar usuario
      var batch = window.FS_DB.batch();
      var canjeRef = window.FS_DB.collection('canjes').doc(codigo);
      batch.set(canjeRef, canjeData);
      batch.update(ref, {
        puntosAcumulados: nuevoPts,
        ultimoCanje: canjeData,
      });
      batch.commit().then(function() {
        // Mostrar recibo
        var fecha = ahora.toLocaleDateString('es-MX', { year:'numeric', month:'long', day:'numeric' });
        var hora  = ahora.toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

        document.getElementById('rec-beneficio').textContent = canje.nombre;
        document.getElementById('rec-pts').textContent       = canje.pts.toLocaleString() + ' pts';
        document.getElementById('rec-fecha').textContent     = fecha;
        document.getElementById('rec-hora').textContent      = hora;
        document.getElementById('rec-usuario').textContent   = user.displayName || user.email || user.uid.slice(0,8);
        document.getElementById('rec-codigo').textContent    = codigo;

        var msg = 'Hola%2C+quiero+activar+mi+canje+FuchiPoints.%0A%0ABeneficio%3A+' +
          encodeURIComponent(canje.nombre) +
          '%0ACodigo%3A+' + codigo +
          '%0AFecha%3A+' + encodeURIComponent(fecha + ' ' + hora) +
          '%0A%0A(Te+mando+la+foto+del+recibo+ahora)';

        document.getElementById('rec-btn-wa').onclick = function() {
          window.open('https://wa.me/528331033506?text=' + msg, '_blank');
        };

        // Notificación automática al dueño
        var msgDueno = 'https://wa.me/528331033506?text=' +
          '🔔+CANJE+FUCHIPOINTS%0A%0A' +
          'Usuario%3A+' + encodeURIComponent(user.displayName || user.email || 'Desconocido') + '%0A' +
          'Email%3A+' + encodeURIComponent(user.email || '—') + '%0A' +
          'Beneficio%3A+' + encodeURIComponent(canje.nombre) + '%0A' +
          'Puntos+canjeados%3A+' + canje.pts + '%0A' +
          'Puntos+restantes%3A+' + nuevoPts + '%0A' +
          'Codigo%3A+' + codigo + '%0A' +
          'Fecha%3A+' + encodeURIComponent(fecha + ' ' + hora);
        setTimeout(function() {
          window.open(msgDueno, '_blank');
        }, 1500);

        reciboOverlay.classList.add('open');

        // Actualizar puntos en pantalla
        var ptsEl = document.getElementById('acc-puntos');
        if (ptsEl) ptsEl.textContent = nuevoPts + ' FuchiPoints';

        // Recargar sección de canje
        var seccion = document.getElementById('canje');
        if (seccion) {
          seccion.remove();
          renderCanje(nuevoPts);
        }
      });
    });
  }

  function abrirConfirmacion(user, canje) {
    userActual  = user;
    canjeActual = canje;
    document.getElementById('canje-modal-txt').textContent =
      'Vas a canjear ' + canje.pts.toLocaleString() + ' FuchiPoints por: ' + canje.nombre;
    confirmOverlay.classList.add('open');
  }

  function renderCanje(puntos) {
    var seccionVieja = document.getElementById('canje');
    if (seccionVieja) seccionVieja.remove();

    var section = document.createElement('div');
    section.className = 'acc-section canje-section';
    section.id = 'canje';

    var title = document.createElement('div');
    title.className = 'acc-section-title';
    title.textContent = '🎁 Canjear FuchiPoints';
    section.appendChild(title);

    var grid = document.createElement('div');
    grid.className = 'canje-grid';

    CANJES.forEach(function(c) {
      var disponible = puntos >= c.pts;
      var item = document.createElement('div');
      var esEmbajador = c.nombre === 'Embajador Fuchito';
      item.className = 'canje-item' + (disponible ? '' : ' bloqueado') + (esEmbajador ? ' canje-embajador' : '');

      item.innerHTML =
        '<div class="canje-left">' +
          '<div class="canje-icon">' + c.icon + '</div>' +
          '<div>' +
            (esEmbajador ? '<div class="canje-embajador-tag">✦ RANGO ESPECIAL</div>' : '') +
            '<div class="canje-nombre">' + c.nombre + '</div>' +
            '<div class="canje-desc">' + c.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<div class="canje-pts">' + c.pts.toLocaleString() + ' pts</div>' +
          (disponible
            ? '<button class="canje-btn" data-idx="' + CANJES.indexOf(c) + '">Canjear</button>'
            : '<button class="canje-btn locked" disabled>🔒 ' + (c.pts - puntos).toLocaleString() + ' pts más</button>') +
        '</div>';

      grid.appendChild(item);
    });

    section.appendChild(grid);

    var nota = document.createElement('p');
    nota.className = 'canje-nota';
    nota.innerHTML = '📸 Al canjear se genera un recibo — tómale foto y mándanosla por WhatsApp para activar tu beneficio.<br><strong>Los puntos se descuentan automáticamente al confirmar.</strong>';
    section.appendChild(nota);

    var recompensas = document.getElementById('recompensas');
    var favSection  = document.getElementById('favoritos');
    var accContent  = document.getElementById('acc-content');
    if (recompensas && recompensas.nextSibling) {
      recompensas.parentNode.insertBefore(section, recompensas.nextSibling);
    } else if (favSection) {
      favSection.parentNode.insertBefore(section, favSection);
    } else if (accContent) {
      accContent.appendChild(section);
    }

    // Eventos de canje
    grid.addEventListener('click', function(e) {
      var btn = e.target.closest('.canje-btn:not(.locked)');
      if (!btn) return;
      var idx   = parseInt(btn.dataset.idx);
      var canje = CANJES[idx];
      var user  = window.FS_AUTH.currentUser;
      if (user && canje) abrirConfirmacion(user, canje);
    });
  }

  function init() {
    if (!window.FS_AUTH) { setTimeout(init, 300); return; }
    window.FS_AUTH.onAuthStateChanged(function(user) {
      if (!user) return;
      window.FS_DB.collection('usuarios').doc(user.uid).get().then(function(snap) {
        var puntos = snap.exists ? (snap.data().puntosAcumulados || 0) : 0;
        renderCanje(puntos);
      });
    });
  }

  setTimeout(init, 500);

})();
