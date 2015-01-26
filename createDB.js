// Load modules
var level = require('level');
var fs = require('fs');
var moment = require('moment');
var rimraf = require('rimraf');

// Create the Database
var dir = './data';
if (fs.existsSync(dir)) {
  rimraf.sync(dir);
}
fs.mkdirSync(dir);
var db = level('./data', { valueEncoding: 'json' });


var batch = [];


// Create 1000 records of mock run data
var days = 0;

for (var i = 0; i < 1000; i++) {
  

  // Create a timestamp
  var timestamp = moment();
  if (i % 3) {
    days++;
    timestamp = timestamp.add(days, 'days');
  }
  
  // Create a method
  var method;
  if (i % 3) {
    method = 'foo';
  }
  if (i % 5) {
    method = 'bar';
  }
  if (i % 3 && i % 5) {
    method = 'baz';
  }
  
  // Create data object
  var obj = {
    method: method,
    timestamp: timestamp
  };

  // Create a key. We put the timestamp in the key so that we can use it as part of the sort
  var key = 'runs' + i + '~' + timestamp.valueOf();
  console.log(key);
  
  // Add to the batch
  batch.push({ type: 'put', key: key, value: obj })
}

// Add a bunch of noise to demonstrate our read script only accesses what is part of the range requested


// Run the batch
db.batch(batch, function (err) {
  if (err) throw err;
  console.log('\033[32mDatabase created\033[0m')
});