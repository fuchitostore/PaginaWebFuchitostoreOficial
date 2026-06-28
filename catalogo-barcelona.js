// catalogo-barcelona.js — Inyecta imágenes del Barcelona al catálogo
(function(){
  var imgs = [];
  for(var i = 1; i <= 62; i++){
    imgs.push('catalogo/barcelona/barcelona-' + i + '.jpg');
  }

  function inject(){
    if(typeof CATALOG_DATA === 'undefined'){
      setTimeout(inject, 200);
      return;
    }
    CATALOG_DATA['grid-barcelona'] = {
      team: 'Barcelona',
      images: imgs
    };
  }

  // Esperar a que todo esté listo
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){ setTimeout(inject, 500); });
  } else {
    setTimeout(inject, 500);
  }
})();
