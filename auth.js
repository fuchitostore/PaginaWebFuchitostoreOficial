(function () {
  'use strict';

  // Cargar catálogo Barcelona
  (function(){var s=document.createElement('script');s.src=(function(){var p=window.location.pathname;return p.substring(0,p.lastIndexOf('/')+1)+'catalogo-barcelona.js';})();document.head.appendChild(s);})();

  // Sistema de toasts premium
  (function(){
    var toastStyle = document.createElement('style');
    toastStyle.textContent = [
      '.fs-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%) translateY(12px);',
      'background:var(--bg2);border:1px solid rgba(255,255,255,0.1);border-radius:10px;',
      'padding:11px 20px;font-size:0.8rem;font-weight:600;color:var(--white);',
      'z-index:9999;pointer-events:none;opacity:0;white-space:nowrap;',
      'box-shadow:0 8px 32px rgba(0,0,0,0.4);',
      'transition:opacity 0.2s ease,transform 0.25s cubic-bezier(0.34,1.2,0.64,1)}',
      '.fs-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}',
      '.fs-toast.success{border-color:rgba(57,255,20,0.25);color:var(--neon)}',
      '.fs-toast.error{border-color:rgba(255,59,59,0.25);color:#FF3B3B}',
      '.fs-toast.info{border-color:rgba(255,183,0,0.25);color:#FFB700}',
    ].join('');
    document.head.appendChild(toastStyle);

    var activeToast = null;
    window.FSToast = function(msg, type, duration) {
      if (activeToast) {
        activeToast.remove();
        activeToast = null;
      }
      var t = document.createElement('div');
      t.className = 'fs-toast ' + (type || 'success');
      t.textContent = msg;
      document.body.appendChild(t);
      activeToast = t;
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ t.classList.add('show'); }); });
      setTimeout(function(){
        t.classList.remove('show');
        setTimeout(function(){ if(t.parentNode) t.remove(); if(activeToast===t) activeToast=null; }, 250);
      }, duration || 2500);
    };
  })();

  // Cargar seo.js
  (function(){var s=document.createElement('script');s.src=(function(){var p=window.location.pathname;return p.substring(0,p.lastIndexOf('/')+1)+'seo.js';})();document.head.appendChild(s);})();

  // Cargar donaciones.js
  (function(){var s=document.createElement('script');s.src=(function(){var p=window.location.pathname;return p.substring(0,p.lastIndexOf('/')+1)+'donaciones.js';})();document.head.appendChild(s);})();
  // Spotify acordeon
  (function(){
    function initSpotify(){
      var widget = document.getElementById('spotifyWidget');
      if(!widget) return;
      var iframe = widget.querySelector('iframe');
      if(!iframe) return;

      var style = document.createElement('style');
      style.textContent = '#spotifyWidget{transition:all 0.35s ease!important;overflow:visible!important}#spotify-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;background:#121212;padding:10px 14px;cursor:pointer;border:none;color:#fff;font-family:Inter,sans-serif;font-size:0.78rem;font-weight:600;gap:8px;border-radius:12px 12px 0 0}.sp-toggle-left{display:flex;align-items:center;gap:8px}.sp-arrow{font-size:0.7rem;color:rgba(255,255,255,0.4);transition:transform 0.3s ease;display:inline-block}#spotifyWidget.sp-open .sp-arrow{transform:rotate(180deg)}#spotify-body{max-height:0;overflow:hidden;transition:max-height 0.35s ease}#spotifyWidget.sp-open #spotify-body{max-height:160px}';
      document.head.appendChild(style);

      widget.innerHTML = '';
      var toggle = document.createElement('button');
      toggle.id = 'spotify-toggle';
      toggle.innerHTML = '<div class="sp-toggle-left"><span>🎵</span><span>Playlist FuchitoStore</span></div><span class="sp-arrow">▼</span>';
      var body = document.createElement('div');
      body.id = 'spotify-body';
      body.appendChild(iframe);
      widget.appendChild(toggle);
      widget.appendChild(body);

      var open = localStorage.getItem('sp-open') !== 'false';
      if(open) widget.classList.add('sp-open');

      toggle.addEventListener('click', function(){
        var o = widget.classList.toggle('sp-open');
        localStorage.setItem('sp-open', o);
      });
    }

    if(document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', initSpotify);
    } else {
      initSpotify();
    }
  })();

  // Inyectar mobile.css
  (function(){var l=document.createElement('link');l.rel='stylesheet';l.href=(function(){var p=window.location.pathname;return p.substring(0,p.lastIndexOf('/')+1)+'mobile.css';})();document.head.appendChild(l);})();

  var style = document.createElement('style');
  style.textContent = '#fs-auth-overlay{display:flex;pointer-events:none;opacity:0;position:fixed;inset:0;z-index:9000;background:rgba(9,9,15,0.88);backdrop-filter:blur(10px);align-items:center;justify-content:center;transition:opacity 0.22s ease}#fs-auth-overlay.fs-open{opacity:1;pointer-events:all}#fs-auth-modal{background:var(--bg2);border:1px solid rgba(57,255,20,0.2);border-radius:16px;padding:40px 36px;width:100%;max-width:400px;box-shadow:0 0 60px rgba(57,255,20,0.08);position:relative;transform:translateY(12px) scale(0.97);transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1),opacity 0.22s ease;opacity:0}#fs-auth-overlay.fs-open #fs-auth-modal{transform:translateY(0) scale(1);opacity:1}#fs-auth-close{position:absolute;top:16px;right:16px;background:transparent;border:none;color:rgba(255,255,255,0.35);font-size:1.3rem;cursor:pointer;transition:color 0.2s;line-height:1}#fs-auth-close:hover{color:var(--white)}.fs-modal-logo{font-family:"Bebas Neue",sans-serif;font-size:1.6rem;letter-spacing:2px;color:var(--neon);text-align:center;margin-bottom:4px}.fs-modal-sub{font-size:0.75rem;color:rgba(255,255,255,0.4);text-align:center;margin-bottom:28px}.fs-tabs{display:flex;gap:0;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:24px}.fs-tab{flex:1;padding:10px;background:transparent;border:none;font-size:0.78rem;font-weight:600;color:rgba(255,255,255,0.35);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;transition:color 0.2s,border-color 0.2s}.fs-tab.active{color:var(--neon);border-bottom-color:var(--neon)}.fs-input{width:100%;background:var(--bg3);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:11px 14px;font-size:0.85rem;color:var(--white);outline:none;transition:border-color 0.2s;margin-bottom:12px;font-family:"Inter",sans-serif}.fs-input:focus{border-color:rgba(57,255,20,0.4)}.fs-input::placeholder{color:rgba(255,255,255,0.22)}.fs-btn-primary{width:100%;padding:12px;border-radius:8px;border:none;background:var(--neon);color:var(--bg);font-weight:700;font-size:0.85rem;cursor:pointer;transition:opacity 0.2s;margin-top:4px}.fs-btn-primary:hover{opacity:0.85}.fs-btn-primary:disabled{opacity:0.45;cursor:not-allowed}.fs-btn-google{width:100%;padding:11px;border-radius:8px;border:1px solid rgba(255,255,255,0.12);background:var(--bg3);color:var(--white);font-weight:600;font-size:0.82rem;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:border-color 0.2s;margin-bottom:16px}.fs-btn-google:hover{border-color:rgba(255,255,255,0.28)}.fs-divider{display:flex;align-items:center;gap:10px;margin-bottom:16px}.fs-divider span{font-size:0.7rem;color:rgba(255,255,255,0.2)}.fs-divider::before,.fs-divider::after{content:"";flex:1;height:1px;background:rgba(255,255,255,0.07)}.fs-error{font-size:0.75rem;color:#FF3B3B;text-align:center;margin-top:10px;min-height:18px}#fs-nav-btn{display:flex;align-items:center;gap:7px;background:transparent;border:1px solid rgba(57,255,20,0.3);color:var(--neon);font-weight:600;font-size:0.78rem;padding:9px 18px;border-radius:6px;cursor:pointer;transition:all 0.2s;white-space:nowrap}#fs-nav-btn:hover{background:rgba(57,255,20,0.08)}#fs-nav-menu{position:absolute;top:calc(100% + 8px);right:0;background:var(--bg2);border:1px solid rgba(57,255,20,0.15);border-radius:10px;padding:8px;min-width:180px;box-shadow:0 12px 40px rgba(0,0,0,0.5);display:none;flex-direction:column;gap:2px;z-index:600}#fs-nav-menu.open{display:flex}.fs-menu-item{display:flex;align-items:center;gap:9px;padding:10px 12px;border-radius:7px;font-size:0.8rem;color:rgba(255,255,255,0.7);text-decoration:none;background:transparent;border:none;cursor:pointer;transition:background 0.15s,color 0.15s;width:100%;text-align:left}.fs-menu-item:hover{background:rgba(255,255,255,0.05);color:var(--white)}.fs-menu-item.danger{color:rgba(255,80,80,0.8)}.fs-menu-item.danger:hover{color:#FF3B3B}#fs-nav-badge{font-size:0.6rem;font-weight:700;padding:2px 7px;border-radius:20px;background:rgba(57,255,20,0.1);color:var(--neon);border:1px solid rgba(57,255,20,0.2)}';
  document.head.appendChild(style);

  var googleSVG = '<svg width="18" height="18" viewBox="0 0 18 18"><path fill="#EA4335" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#4285F4" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#34A853" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/></svg>';

  var overlayEl = document.createElement('div');
  overlayEl.id = 'fs-auth-overlay';
  overlayEl.innerHTML = '<div id="fs-auth-modal"><button id="fs-auth-close" aria-label="Cerrar">X</button><div class="fs-modal-logo">Fuchito Store</div><div class="fs-modal-sub">Tu cuenta, tus jerseys, tus recompensas</div><div class="fs-tabs"><button class="fs-tab active" data-panel="login">Iniciar sesion</button><button class="fs-tab" data-panel="register">Registrarse</button></div><div id="fs-panel-login"><button class="fs-btn-google" id="fs-google-login">' + googleSVG + 'Continuar con Google</button><div class="fs-divider"><span>o</span></div><input class="fs-input" id="fs-login-email" type="email" placeholder="Correo electronico" autocomplete="email"><input class="fs-input" id="fs-login-pass" type="password" placeholder="Contrasena" autocomplete="current-password"><button class="fs-btn-primary" id="fs-login-submit">Iniciar sesion</button><div class="fs-error" id="fs-login-err"></div></div><div id="fs-panel-register" style="display:none"><button class="fs-btn-google" id="fs-google-register">' + googleSVG + 'Registrarse con Google</button><div class="fs-divider"><span>o</span></div><input class="fs-input" id="fs-reg-name" type="text" placeholder="Tu nombre" autocomplete="name"><input class="fs-input" id="fs-reg-email" type="email" placeholder="Correo electronico" autocomplete="email"><input class="fs-input" id="fs-reg-pass" type="password" placeholder="Contrasena (min. 6 caracteres)" autocomplete="new-password"><button class="fs-btn-primary" id="fs-reg-submit">Crear cuenta</button><div class="fs-error" id="fs-reg-err"></div></div></div>';
  document.body.appendChild(overlayEl);

    var basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

  // Agregar link Nosotros en la nav
  var nosotrosLink = document.createElement('a');
  nosotrosLink.href = basePath + 'quienes-somos.html';
  nosotrosLink.textContent = 'Nosotros';
  nosotrosLink.style.cssText = 'font-size:0.78rem;font-weight:500;color:rgba(255,255,255,0.6);text-decoration:none;margin-right:8px;transition:color 0.2s';
  nosotrosLink.onmouseover = function(){ this.style.color='#fff'; };
  nosotrosLink.onmouseout = function(){ this.style.color='rgba(255,255,255,0.6)'; };
  if (window.location.pathname.indexOf('quienes-somos') !== -1) {
    nosotrosLink.style.color = '#fff';
  }

  var navWrapper = document.createElement('div');
  navWrapper.style.cssText = 'position:relative;display:inline-flex;align-items:center';
  navWrapper.innerHTML = '<button id="fs-nav-btn">Mi cuenta</button><div id="fs-nav-menu"><a href="' + basePath + 'account.html" class="fs-menu-item">Mi perfil</a><a href="' + basePath + 'chat.html" class="fs-menu-item">💬 Mensajes</a><a href="' + basePath + 'account.html#micoleccion" class="fs-menu-item">Mi Coleccion</a><a href="' + basePath + 'account.html#recompensas" class="fs-menu-item">FuchiPoints</a><hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:4px 0"><button class="fs-menu-item danger" id="fs-logout-btn">Cerrar sesion</button></div>';

  // Insertar link Nosotros antes del botón de cuenta
  var slot = document.getElementById('fs-nav-slot');
  var navWa = document.querySelector('.nav-wa');
  var navEl = document.querySelector('nav');
  if (slot) {
    slot.parentNode.insertBefore(nosotrosLink, slot);
    slot.appendChild(navWrapper);
  } else if (navWa && navWa.parentNode) {
    navWa.parentNode.insertBefore(navWrapper, navWa);
  } else if (navEl) {
    navEl.appendChild(navWrapper);
  }

  var overlay = document.getElementById('fs-auth-overlay');
  var navBtn = document.getElementById('fs-nav-btn');
  var navMenu = document.getElementById('fs-nav-menu');
  var closeBtn = document.getElementById('fs-auth-close');
  var loginErr = document.getElementById('fs-login-err');
  var regErr = document.getElementById('fs-reg-err');

  function openModal(panel) {
    overlay.classList.add('fs-open');
    showPanel(panel || 'login');
  }
  function closeModal() { overlay.classList.remove('fs-open'); }

  function showPanel(id) {
    document.getElementById('fs-panel-login').style.display = id === 'login' ? '' : 'none';
    document.getElementById('fs-panel-register').style.display = id === 'register' ? '' : 'none';
    document.querySelectorAll('.fs-tab').forEach(function (t) {
      t.classList.toggle('active', t.dataset.panel === id);
    });
    if (loginErr) loginErr.textContent = '';
    if (regErr) regErr.textContent = '';
  }

  function setLoading(btnId, loading) {
    var btn = document.getElementById(btnId);
    if (btn) btn.disabled = loading;
  }

  function errorMsg(elId, msg) {
    var el = document.getElementById(elId);
    if (el) el.textContent = msg;
  }

  function translateError(code) {
    var msgs = {
      'auth/user-not-found': 'No existe una cuenta con ese correo.',
      'auth/wrong-password': 'Contrasena incorrecta.',
      'auth/email-already-in-use': 'Ese correo ya esta registrado.',
      'auth/weak-password': 'La contrasena debe tener al menos 6 caracteres.',
      'auth/invalid-email': 'El correo no es valido.',
      'auth/popup-closed-by-user': 'Cancelaste el inicio con Google.',
      'auth/invalid-credential': 'Correo o contrasena incorrectos.',
      'auth/unauthorized-domain': 'Este sitio no esta autorizado en Firebase (agrega el dominio en Authentication > Settings > Authorized domains).',
      'auth/popup-blocked': 'El navegador bloqueo la ventana de Google. Permite ventanas emergentes e intenta de nuevo.',
      'auth/cancelled-popup-request': 'Se cancelo la solicitud anterior. Intenta de nuevo.',
      'auth/network-request-failed': 'Error de conexion. Revisa tu internet e intenta de nuevo.'
    };
    if (!msgs[code]) console.warn('[FuchitoStore] Codigo de error sin traducir:', code);
    return msgs[code] || 'Ocurrio un error. Intenta de nuevo.';
  }

  function upsertUserDoc(user, extraData) {
    var ref = window.FS_DB.collection('usuarios').doc(user.uid);
    return ref.get().then(function (snap) {
      if (!snap.exists) {
        var nombreFinal = user.displayName || (extraData && extraData.nombre) || 'Usuario';
        // Perfil público, visible para cualquier usuario logueado (usado por la mensajería)
        window.FS_DB.collection('perfilesPublicos').doc(user.uid).set({
          displayName: nombreFinal,
          photoURL: user.photoURL || null
        }).catch(function (e) { console.warn('[FuchitoStore] perfilesPublicos:', e.message); });

        return ref.set(Object.assign({
          nombre: nombreFinal,
          email: user.email,
          fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
          totalCompras: 0,
          puntosAcumulados: 50,
          nivel: 'aficionado'
        }, extraData || {}));
      }
    });
  }

  function googleAuth() {
    var provider = new firebase.auth.GoogleAuthProvider();
    return window.FS_AUTH.signInWithPopup(provider).catch(function (e) {
      if (e.code === 'auth/popup-blocked' || e.code === 'auth/cancelled-popup-request') {
        return window.FS_AUTH.signInWithRedirect(provider);
      }
      throw e;
    });
  }

  document.querySelectorAll('.fs-tab').forEach(function (tab) {
    tab.addEventListener('click', function () { showPanel(tab.dataset.panel); });
  });

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });

  document.getElementById('fs-google-login').addEventListener('click', function () {
    googleAuth().then(function (result) {
      return upsertUserDoc(result.user);
    }).then(closeModal).catch(function (e) { errorMsg('fs-login-err', translateError(e.code)); });
  });

  document.getElementById('fs-google-register').addEventListener('click', function () {
    googleAuth().then(function (result) {
      return upsertUserDoc(result.user);
    }).then(closeModal).catch(function (e) { errorMsg('fs-reg-err', translateError(e.code)); });
  });

  document.getElementById('fs-login-submit').addEventListener('click', function () {
    var email = document.getElementById('fs-login-email').value.trim();
    var pass = document.getElementById('fs-login-pass').value;
    if (!email || !pass) { errorMsg('fs-login-err', 'Completa todos los campos.'); return; }
    setLoading('fs-login-submit', true);
    window.FS_AUTH.signInWithEmailAndPassword(email, pass)
      .then(closeModal)
      .catch(function (e) { errorMsg('fs-login-err', translateError(e.code)); })
      .finally(function () { setLoading('fs-login-submit', false); });
  });

  document.getElementById('fs-reg-submit').addEventListener('click', function () {
    var nombre = document.getElementById('fs-reg-name').value.trim();
    var email = document.getElementById('fs-reg-email').value.trim();
    var pass = document.getElementById('fs-reg-pass').value;
    if (!nombre || !email || !pass) { errorMsg('fs-reg-err', 'Completa todos los campos.'); return; }
    setLoading('fs-reg-submit', true);
    window.FS_AUTH.createUserWithEmailAndPassword(email, pass)
      .then(function (cred) {
        return cred.user.updateProfile({ displayName: nombre })
          .then(function () { return upsertUserDoc(cred.user, { nombre: nombre }); });
      })
      .then(closeModal)
      .catch(function (e) { errorMsg('fs-reg-err', translateError(e.code)); })
      .finally(function () { setLoading('fs-reg-submit', false); });
  });

  navBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var user = window.FS_AUTH.currentUser;
    if (user) {
      window.location.href = basePath + 'account.html';
    } else {
      openModal('login');
    }
  });

  document.addEventListener('click', function () { navMenu.classList.remove('open'); });

  document.getElementById('fs-logout-btn').addEventListener('click', function () {
    window.FS_AUTH.signOut().then(function () {
      navMenu.classList.remove('open');
      if (window.location.pathname.indexOf('account') !== -1) {
        window.location.href = basePath + 'index.html';
      }
    });
  });

  window.FS_AUTH.onAuthStateChanged(function (user) {
    if (user) {
      navBtn.innerHTML = '👤 ...';
      window.FS_DB.collection('usuarios').doc(user.uid).get().then(function (snap) {
        var nombre = 'Cuenta';
        var nivel = 'aficionado';
        if (snap.exists) {
          var data = snap.data();
          nombre = (data.nombre && data.nombre.trim()) ? data.nombre.split(' ')[0] : (user.displayName ? user.displayName.split(' ')[0] : 'Cuenta');
          nivel = data.nivel || 'aficionado';
        } else if (user.displayName) {
          nombre = user.displayName.split(' ')[0];
        }
        // Recalcular nivel desde puntos para que siempre sea correcto
        var puntos = data ? (data.puntosAcumulados || 0) : 0;
        var nivelCalc = 'aficionado';
        if (puntos >= 5000) nivelCalc = 'leyenda';
        else if (puntos >= 2499) nivelCalc = 'coleccionista';
        else if (puntos >= 799) nivelCalc = 'hincha';
        var niveles = {
          aficionado: { emoji: '⚽', label: 'Aficionado' },
          hincha: { emoji: '🔥', label: 'Hincha' },
          coleccionista: { emoji: '🏆', label: 'Coleccionista' },
          leyenda: { emoji: '👑', label: 'Leyenda' }
        };
        var n = niveles[nivelCalc] || niveles.aficionado;
        navBtn.innerHTML = '👤 ' + nombre + ' <span id="fs-nav-badge">' + n.emoji + ' ' + n.label + '</span>';
        // Corregir en Firestore si el nivel guardado es incorrecto
        if (snap.exists && snap.data().nivel !== nivelCalc) {
          window.FS_DB.collection('usuarios').doc(user.uid).update({ nivel: nivelCalc }).catch(function(){});
        }
      }).catch(function () {
        navBtn.innerHTML = '👤 ' + (user.displayName ? user.displayName.split(' ')[0] : 'Cuenta');
      });
    } else {
      navBtn.innerHTML = '👤 Mi cuenta';
    }
  });

  window.FSAuth = { openModal: openModal, closeModal: closeModal };

})();
