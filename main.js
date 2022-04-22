
const MySQLClient = require('./src/client');

exports.createClient = (...args) => new MySQLClient(...args);
