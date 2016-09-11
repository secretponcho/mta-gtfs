var express = require('express');
var Router = express.Router();

Router.get('/', function(req, res) {
  return res.sendFile('./index.html');
});

module.exports = Router;