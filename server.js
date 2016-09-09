var express = require('express'),
    app     = express();

var debug = require('debug')('::http');

const HOST = process.env.host || '0.0.0.0';
const PORT = process.env.port || 3000;

app.get('/', function(req, res) {
  return res.sendFile(__dirname + '/views/index.html');
});

app.listen(PORT, function() {
  debug("App is listening on Port %s", PORT);
});