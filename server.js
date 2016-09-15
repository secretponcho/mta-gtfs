var express = require('express'),
    app     = express();

var debug = require('debug')('::http');

const HOST = process.env.host || '0.0.0.0';
const PORT = process.env.port || 3000;

(function configureRoutes() {
  var index = require('./app/index/routes');
  app.use('/', index);
})();

app.use(express.static('public'));

app.listen(PORT, function() {
  debug("App is listening on Port %s", PORT);
});