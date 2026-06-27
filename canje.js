// canje.js — FuchitoStore
// Sección de canje de puntos en account.html

(function () {
  'use strict';

  if (window.location.pathname.indexOf('account') === -1) return;

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
    '.canje-btn{background:var(--neon);color:var(--bg);font-weight:700;font-size:0.75rem;padding:9px 16px;border-radius:8px;border:none;cursor:pointer;transition:opacity 0.2s;white-space:nowrap;text-decoration:none}',
    '.canje-btn:hover{opacity:0.85}',
    '.canje-btn.locked{background:var(--bg3);color:var(--muted);cursor:not-allowed;border:1px solid var(--border)}',
    '.canje-nota{font-size:0.73rem;color:var(--muted);text-align:center;margin-top:16px;line-height:1.6}',
    '@media(max-width:600px){.canje-item{flex-direction:column;align-items:flex-start}.canje-btn{width:100%;text-align:center}}',
  ].join('');
  document.head.appendChild(style);

  var CANJES = [
    { icon:'🚀', nombre:'Envío prioritario',          desc:'Tu pedido se procesa primero que los demás',         pts:500  },
    { icon:'📦', nombre:'Envío gratis',               desc:'En tu próximo pedido aunque sea 1 pieza',            pts:1000 },
    { icon:'💰', nombre:'$50 MXN de descuento',       desc:'Descuento directo en tu siguiente jersey',           pts:2500 },
    { icon:'⭐', nombre:'Parche oficial de competición',desc:'Champions, Ligas o Copa incluido en tu jersey',    pts:4000 },
    { icon:'👑', nombre:'$100 MXN + Acceso preventa', desc:'Descuento exclusivo y primer acceso a novedades',    pts:7000 },
  ];

  var MSG_BASE = 'Hola%2C+quiero+canjear+mis+FuchiPoints+por%3A+';

  function renderCanje(puntos) {
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
      item.className = 'canje-item' + (disponible ? '' : ' bloqueado');

      var msg = encodeURIComponent(c.nombre + ' (' + c.pts + ' pts)');
      var waLink = 'https://wa.me/528331033506?text=' + MSG_BASE + msg;

      item.innerHTML =
        '<div class="canje-left">' +
          '<div class="canje-icon">' + c.icon + '</div>' +
          '<div>' +
            '<div class="canje-nombre">' + c.nombre + '</div>' +
            '<div class="canje-desc">' + c.desc + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<div class="canje-pts">' + c.pts.toLocaleString() + ' pts</div>' +
          (disponible
            ? '<a href="' + waLink + '" target="_blank" class="canje-btn">Canjear</a>'
            : '<button class="canje-btn locked" disabled>🔒 ' + (c.pts - puntos).toLocaleString() + ' pts más</button>') +
        '</div>';

      grid.appendChild(item);
    });

    section.appendChild(grid);

    var nota = document.createElement('p');
    nota.className = 'canje-nota';
    nota.innerHTML = 'Para canjear haz clic en el botón — te llevará a WhatsApp con tu solicitud lista.<br><strong>Tus puntos se descuentan manualmente al confirmar el canje.</strong>';
    section.appendChild(nota);

    // Insertar antes de la sección de favoritos
    var favSection = document.getElementById('favoritos');
    var content = document.getElementById('acc-content');
    if (favSection) {
      favSection.parentNode.insertBefore(section, favSection);
    } else if (content) {
      content.appendChild(section);
    }
  }

  // Esperar a que Firebase esté listo
  function init() {
    window.FS_AUTH.onAuthStateChanged(function(user) {
      if (!user) return;
      window.FS_DB.collection('usuarios').doc(user.uid).get().then(function(snap) {
        var puntos = snap.exists ? (snap.data().puntosAcumulados || 0) : 0;
        renderCanje(puntos);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
