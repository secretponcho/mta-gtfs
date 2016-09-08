var R = require('ramda');
(function(R) {
  var trace = R.curry(function(tag, x) {
    console.log(tag, x);
    return x;
  }); 
  
  var Impure = {
    getJSON: R.curry(function(url, callback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url);
      xhr.send(null);
      xhr.addEventListener('load', callback);
    }),
    setHTML: R.curry(function(query, html) {
      document.querySelector(query).innerHTML = html;
    })
  };
  
  var url = function(term) {
    return 'https://api.flickr.com/services/feeds/photos_public.gne?tags=' +
      term + '&format=json&jsoncallback=?';
  };
  
  alert(typeof R === 'undefined');
  
})(R);
