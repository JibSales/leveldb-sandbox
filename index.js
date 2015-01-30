// Load modules
var level   = require('level');
var resolve = require('path').resolve;
var moment  = require('moment');
var findAPI = require('./lib/find');
var utils   = require('./lib/utils');

// Set a data location
var dir = resolve(__dirname, './data');

// Reset the Database
utils.resetData(dir);

// Create a DB object
var db = level(dir, { valueEncoding: 'json' });

// Attach Find API
db = findAPI(db);

// Create the database
utils.createData(db, function (err) {
  if (err) throw err;
  console.log('\033[32mDatabase created\033[0m');

  // Create the query
  var query = { method: 'baz', day: moment() };

  // Execute the query (uses index!)
  db.find(query, function (err, results, stats) {
    if (err) throw err;
    utils.printResults('All found runs:', results, stats);
  });
  
});