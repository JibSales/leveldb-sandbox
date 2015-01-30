// Load modules
var moment = require('moment');


module.exports = function (db) {
  
  db.find = function (query, done) {
    var results = [];
    var stats = { dataHits: 0, matchHits: 0 };
    var startTime = moment().valueOf();

    // Create a read stream, only looking within the prefixed range.
    this.createReadStream({
      start: 'runs',
      end: 'runs\xFF'
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
      stats.time = moment().valueOf() - startTime;
      done(null, results, stats);
    });
  }

  return db;
}