// Load modules
var level = require('level');
var fs = require('fs');
var moment = require('moment');
var rimraf = require('rimraf');

// Reset the Database
var dir = './data';
if (fs.existsSync(dir)) {
  rimraf.sync(dir);
}
fs.mkdirSync(dir);
var db = level('./data', { valueEncoding: 'json' });



function createDB (done) {
  
  var batch = [];

  // Create 1000 records of mock run data
  var days = 0;

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
    var key = 'runs\x00' + i;
    
    // Add to the batch
    batch.push({ type: 'put', key: key, value: obj })
  }

  // Run the batch
  db.batch(batch, done);
}



function find (query, done) {
  var results = [];
  var stats = { dataHits: 0, matchHits: 0 };

  // Create a read stream, only looking within the prefixed range.
  db.createReadStream({
    start: 'runs\x00',
    end: 'runs\x00\xFF'
  })

  // Perform our query. See the README on ways this should be improved.
  .on('data', function (data) {

    // Increment our DataHits stats counter
    stats.dataHits++;

    // Filter our data object
    if (data.value.method === query.method && query.day.isSame(moment(data.value.timestamp), 'day')) {
      
      // Increment our matchHits stats counter
      stats.matchHits++;
      
      // Push our results
      results.push(data);
    }
  })

  // Handle Errors
  .on('error', done)
  
  // On success, return the results array and stats
  .on('close', function () {
    done(null, results, stats);
  });
}


// Create the database
createDB(function (err) {
  if (err) throw err;
  console.log('\033[32mDatabase created\033[0m');

  // Create the query
  var query = { method: 'baz', day: moment() };

  // Execute the query
  find(query, function (err, results, stats) {
    if (err) throw err;

    // Print the results to console
    results.forEach(function (result) {
      console.log('Method: %s Day: %s', result.value.method, moment(result.value.timestamp).format('MM-DD-YYYY'));  
    });
    console.log('\033[32mData hits:\033[0m %d \n\033[32mMatch hits:\033[0m %d', stats.dataHits, stats.matchHits);
  });
  
});