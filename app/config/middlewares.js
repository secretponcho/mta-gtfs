module.exports = function(app) {
  var logger = require('morgan');
  app.use(logger('dev')); // Log HTTP requests

  var bodyParser = require('body-parser');

  app.use(bodyParser.json({
    limit: '1000mb'
  })); // get information from html forms
  app.use(bodyParser.urlencoded({
    limit: '1000mb',
    extended: true
  }));

  var cookieParser = require('cookie-parser');
  app.use(cookieParser()); // read cookies (needed for auth)

  var methodOverride = require('method-override');
  app.use(methodOverride());

}