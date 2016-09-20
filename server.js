var express = require('express'),
    app     = express();

// Disable X-Powered-By header
app.disable('x-powered-by');

var debug = require('debug')('::http');

const HOST = process.env.host || '0.0.0.0';
const PORT = process.env.port || 3000;

app.use(express.static('public'));

var path = require('path');

// require(path.resolve('app/config/middlewares'))(app);
require(path.resolve('app/config/routes'))(app);

app.listen(PORT, function() {
  debug("App is listening on Port %s", PORT);
});