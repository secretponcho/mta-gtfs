module.exports = function database(dbname) {
  const MONGO_HOST      = process.env.OPENSHIFT_MONGODB_DB_HOST   || 'localhost';
  const MONGO_PORT      = process.env.OPENSHIFT_MONGODB_DB_PORT   || '27017';
  // TODO: figure out how to dynamically set port and host
  
  const mongo = require('mongoskin');
  const db = mongo.db("mongodb://localhost:27017/" + dbname || "umoobi_dev", {native_parser:true});
  return db;
}