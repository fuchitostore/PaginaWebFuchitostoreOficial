// catalogo-barcelona.js — Inyecta imágenes del Barcelona al catálogo
(function(){
  function init(){
    if (typeof CATALOG_DATA === 'undefined') return setTimeout(init, 100);
    
    var imgs = [];
    for(var i = 1; i <= 62; i++){
      imgs.push('catalogo/barcelona/barcelona-' + i + '.jpg');
    }
    
    CATALOG_DATA['grid-barcelona'] = {
      team: 'Barcelona',
      images: imgs
    };

    // Si el grid ya existe en el DOM, cargarlo
    var grid = document.getElementById('grid-barcelona');
    if(grid && grid.children.length === 0 && typeof loadGrid === 'function'){
      loadGrid('grid-barcelona');
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
