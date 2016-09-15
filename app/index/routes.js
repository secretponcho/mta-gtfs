var express = require('express');
var Router = express.Router();

Router.get('/', function(req, res) {
  return res.sendFile(__dirname + '/index.html');
});

module.exports = Router;