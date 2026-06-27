// spotify-widget.js — FuchitoStore
// Convierte el widget de Spotify en un acordeón que se abre y cierra

(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent = [
    '#spotifyWidget{',
      'position:fixed;bottom:20px;left:20px;z-index:8888;',
      'width:300px;border-radius:12px;overflow:hidden;',
      'box-shadow:0 8px 32px rgba(57,255,20,0.25);',
      'border:1px solid rgba(57,255,20,0.5);',
      'transition:all 0.35s ease',
    '}',
    '@media(max-width:480px){#spotifyWidget{width:88vw;left:6vw;bottom:14px}}',

    // Botón toggle
    '#spotify-toggle{',
      'width:100%;display:flex;align-items:center;justify-content:space-between;',
      'background:#121212;padding:10px 14px;cursor:pointer;',
      'border:none;color:#fff;font-family:"Inter",sans-serif;',
      'font-size:0.78rem;font-weight:600;gap:8px',
    '}',
    '.sp-toggle-left{display:flex;align-items:center;gap:8px}',
    '.sp-icon{font-size:1rem}',
    '.sp-label{color:rgba(255,255,255,0.8)}',
    '.sp-arrow{',
      'font-size:0.7rem;color:rgba(255,255,255,0.4);',
      'transition:transform 0.3s ease',
    '}',
    '#spotifyWidget.open .sp-arrow{transform:rotate(180deg)}',

    // Contenido colapsable
    '#spotify-body{',
      'max-height:0;overflow:hidden;',
      'transition:max-height 0.35s ease',
    '}',
    '#spotifyWidget.open #spotify-body{max-height:160px}',
  ].join('');
  document.head.appendChild(style);

  // Esperar a que el DOM esté listo
  function init() {
    var widget = document.getElementById('spotifyWidget');
    if (!widget) return;

    // Guardar el iframe original
    var iframe = widget.querySelector('iframe');
    if (!iframe) return;

    // Reconstruir el widget con acordeón
    widget.innerHTML = '';

    var toggle = document.createElement('button');
    toggle.id = 'spotify-toggle';
    toggle.innerHTML =
      '<div class="sp-toggle-left">' +
        '<span class="sp-icon">🎵</span>' +
        '<span class="sp-label">Playlist FuchitoStore</span>' +
      '</div>' +
      '<span class="sp-arrow">▼</span>';

    var body = document.createElement('div');
    body.id = 'spotify-body';
    body.appendChild(iframe);

    widget.appendChild(toggle);
    widget.appendChild(body);

    // Estado guardado en localStorage
    var isOpen = localStorage.getItem('spotify-open') !== 'false';
    if (isOpen) widget.classList.add('open');

    toggle.addEventListener('click', function () {
      var open = widget.classList.toggle('open');
      localStorage.setItem('spotify-open', open);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
