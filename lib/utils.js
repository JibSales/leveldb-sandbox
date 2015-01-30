// Load modules
var level = require('level');
var fs = require('fs');
var moment = require('moment');
var rimraf = require('rimraf');


exports.resetData = function (dir) {
  if (fs.existsSync(dir)) {
    rimraf.sync(dir);
  }
  fs.mkdirSync(dir);
}


exports.createData = function (db, done) {
  
  var runsBatch = [];
  var indexBatch = [];
  var days = 0;

  // Create 1000 records of mock run data
  for (var i = 0; i < 1000; i++) {
    
    // Create a timestamp
    var timestamp = moment();
    if (i % 20) {
      days++;
      timestamp = timestamp.add(days, 'days');
    }
    
    // Create a variety of methods
    var method;
    if (i % 3) {
      method = 'foo';
    }
    else if (i % 5) {
      method = 'bar';
    }
    else {
      method = 'baz';
    }
    
    // Create data object
    var obj = {
      method: method,
      timestamp: timestamp.valueOf()
    };

    // Create a key with a UID. We delimit by the null character because null is the first character in the ASCII 
    // sequence and LevelDB sorts lexicographically.
    var key = 'runs' + i;
    
    // Add to the runs batch
    runsBatch.push({ type: 'put', key: key, value: obj })

    // Add to the index batch
    indexBatch.push({
      type: 'put',

      // Create the index key to contain the method and the timestamp but also the run ID to prevent collision and
      // so we don't need to spend time/space looking up/storing value
      key: [obj.method, obj.timestamp, key].join('\x00'),
      
      // We don't need to store a value when using multi-dimensional keys for the index
      value: null
    });
  }

  // Run the batch
  db.batch(runsBatch.concat(indexBatch), done);
}

exports.printResults = function (header, results, stats) {
  // Print the header
  console.log('');
  console.log('\033[32m' + header + '\033[0m');

  // Print the results to console
  results.forEach(function (result) {
    console.log('Method: %s Day: %s', result.method, moment(result.timestamp).format('MM-DD-YYYY'));  
  });
  
  // Print the stats
  console.log('\033[32mData hits:\033[0m %d \n\033[32mMatch hits:\033[0m %d \n\033[32mTime:\033[0m %dms', stats.dataHits, stats.matchHits, stats.time);
}