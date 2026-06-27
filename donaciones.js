// donaciones.js — FuchitoStore
// Inyecta la sección de donaciones antes del footer

(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent = [
    '#fs-donaciones{padding:80px 36px;background:var(--bg);border-top:1px solid var(--border)}',
    '.don-inner{max-width:900px;margin:0 auto}',
    '.don-tag{font-size:0.7rem;letter-spacing:3px;text-transform:uppercase;color:var(--neon);margin-bottom:12px}',
    '.don-title{font-family:"Bebas Neue",sans-serif;font-size:3rem;letter-spacing:2px;line-height:1;margin-bottom:12px}',
    '.don-sub{font-size:0.9rem;color:var(--muted);line-height:1.7;max-width:560px;margin-bottom:40px}',

    // Metas
    '.don-metas{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:40px}',
    '.don-meta{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px;transition:border-color 0.2s}',
    '.don-meta:hover{border-color:rgba(57,255,20,0.2)}',
    '.don-meta-icon{font-size:1.8rem;margin-bottom:10px}',
    '.don-meta-title{font-weight:700;font-size:0.88rem;margin-bottom:4px}',
    '.don-meta-desc{font-size:0.75rem;color:var(--muted);line-height:1.5}',

    // Métodos de pago
    '.don-metodos{display:flex;flex-direction:column;gap:12px;margin-bottom:32px}',
    '.don-metodo{background:var(--bg2);border:1px solid var(--border);border-radius:12px;padding:20px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}',
    '.don-metodo-info{display:flex;align-items:center;gap:14px}',
    '.don-metodo-icon{font-size:1.6rem}',
    '.don-metodo-nombre{font-weight:700;font-size:0.9rem;margin-bottom:2px}',
    '.don-metodo-desc{font-size:0.75rem;color:var(--muted)}',
    '.don-btn{background:var(--neon);color:var(--bg);font-weight:700;font-size:0.8rem;padding:10px 20px;border-radius:8px;text-decoration:none;border:none;cursor:pointer;transition:opacity 0.2s;white-space:nowrap}',
    '.don-btn:hover{opacity:0.85}',
    '.don-btn.secondary{background:transparent;color:var(--white);border:1px solid rgba(255,255,255,0.15)}',
    '.don-btn.secondary:hover{border-color:rgba(255,255,255,0.4)}',

    // Nota
    '.don-nota{font-size:0.75rem;color:var(--muted);text-align:center;line-height:1.6}',
    '.don-nota strong{color:var(--white)}',

    // Mobile
    '@media(max-width:768px){',
      '#fs-donaciones{padding:48px 16px}',
      '.don-title{font-size:2.2rem}',
      '.don-metodo{flex-direction:column;align-items:flex-start}',
      '.don-btn{width:100%;text-align:center}',
    '}',
  ].join('');
  document.head.appendChild(style);

  var seccion = document.createElement('section');
  seccion.id = 'fs-donaciones';
  seccion.innerHTML = [
    '<div class="don-inner">',
      '<div class="don-tag">Apoya a FuchitoStore</div>',
      '<h2 class="don-title">Ayúdanos a crecer 🐱⚽</h2>',
      '<p class="don-sub">FuchitoStore es un proyecto hecho con pasión desde Tamaulipas. Cada donación nos ayuda a mejorar y seguir trayendo los mejores jerseys a toda la comunidad.</p>',

      // Metas
      '<div class="don-metas">',
        '<div class="don-meta"><div class="don-meta-icon">🚀</div><div class="don-meta-title">Crecer el catálogo</div><div class="don-meta-desc">Agregar más equipos, jerseys exclusivos y ediciones especiales.</div></div>',
        '<div class="don-meta"><div class="don-meta-icon">💻</div><div class="don-meta-title">Mejorar la página</div><div class="don-meta-desc">Nuevas funciones, mejor experiencia y más herramientas para la comunidad.</div></div>',
        '<div class="don-meta"><div class="don-meta-icon">📦</div><div class="don-meta-title">Mejor empaque</div><div class="don-meta-desc">Empaques más profesionales y presentación premium en cada pedido.</div></div>',
        '<div class="don-meta"><div class="don-meta-icon">🐱</div><div class="don-meta-title">Cuidar a Fuchito</div><div class="don-meta-desc">Nuestro embajador oficial merece lo mejor. Cada donación es un abrazo para él.</div></div>',
      '</div>',

      // Métodos de pago
      '<div class="don-metodos">',
        // PayPal
        '<div class="don-metodo">',
          '<div class="don-metodo-info">',
            '<div class="don-metodo-icon">🅿️</div>',
            '<div>',
              '<div class="don-metodo-nombre">PayPal</div>',
              '<div class="don-metodo-desc">Rápido, seguro y sin complicaciones</div>',
            '</div>',
          '</div>',
          '<a href="https://paypal.me/FuchitoStore" target="_blank" class="don-btn">Donar con PayPal</a>',
        '</div>',

        // WhatsApp (CLABE próximamente)
        '<div class="don-metodo">',
          '<div class="don-metodo-info">',
            '<div class="don-metodo-icon">🏦</div>',
            '<div>',
              '<div class="don-metodo-nombre">Transferencia bancaria</div>',
              '<div class="don-metodo-desc">CLABE interbancaria — próximamente disponible</div>',
            '</div>',
          '</div>',
          '<a href="https://wa.me/528331033506?text=Hola%2C+quiero+hacer+una+donaci%C3%B3n+a+FuchitoStore" target="_blank" class="don-btn secondary">Contactar por WhatsApp</a>',
        '</div>',
      '</div>',

      '<p class="don-nota">Toda donación es <strong>voluntaria</strong> y va directo al crecimiento de FuchitoStore. 🙌<br>No es obligatoria y no afecta tu experiencia de compra.</p>',
    '</div>',
  ].join('');

  // Insertar antes del footer
  var footer = document.querySelector('footer');
  if (footer) {
    footer.parentNode.insertBefore(seccion, footer);
  } else {
    document.body.appendChild(seccion);
  }

})();
