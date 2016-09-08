var express = require('express'),
    app     = express();

var debug = require('debug')('::http');

const HOST = process.env.host || '0.0.0.0';
const PORT = process.env.port || 3000;

app.use(express.static('public'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
  return res.render('index');  
});

app.listen(PORT, function() {
  debug("App is listening on Port %s", PORT);
});