function assignRoute(path, app, route) {
  return function(route) {
    app.use(path, route);
  };
}

function buildPath(base, suffix, module) {
  var path = require('path');
  return function(module) {
    return path.resolve(base + '/' + module + '/' + suffix);
  };
}

module.exports = function(app) {
  
  var routePath   = buildPath('app', 'routes');
  var routeApp    = assignRoute('/', app);
 
  var index     = require(routePath('index'));
  
  routeApp(index);
}