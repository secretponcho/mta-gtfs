module.exports = function configureRedis(app) {
  const REDIS_HOST      = process.env.OPENSHIFT_REDIS_HOST        || 'localhost';
  const REDIS_PORT      = process.env.OPENSHIFT_REDIS_PORT        || '6379';
  
  var session         = require('express-session');
  var RedisStore      = require('connect-redis')(session);
  var redis           = require('redis');

  var client = redis.createClient({host: REDIS_HOST, port: REDIS_PORT});
  if (process.env.REDIS_PASSWORD)
    client.auth(process.env.REDIS_PASSWORD || 'ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5');

  client.on('connect', function() {
  });

  client.on('error', function(err) {
    throw new Error('THERE WAS A PROBLEM WITH REDIS CLIENT: ' + err + Date.now());
  });

  // required for persistent sessions
  app.use(session({
    cookieName: 'session',
    store: new RedisStore(),
    resave: false,
    secret: '7<FB2RO@d8<843q:P6$4Bp08j0E8It',
    saveUninitialized: false,
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true
  }));
  
}
