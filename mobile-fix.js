(function(){
  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = (function(){
    var path = window.location.pathname;
    return path.substring(0, path.lastIndexOf('/') + 1) + 'mobile.css';
  })();
  document.head.appendChild(css);
})();
