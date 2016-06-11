var aws = require('aws-sdk');
var s3 = new aws.S3();

var config;

exports.setConfig = function(_config) {
  config = _config;
};

exports.handler = function(event, context, callback) {
  var srcBucket = event.Records[0].s3.bucket.name;
  var srcKey = event.Records[0].s3.object.key;
  console.log('Handling event for s3://' + srcBucket + '/' + srcKey);

  var fetchFromS3 = function() {
    console.log('fetchFromS3');
    return new Promise(function(resolve, reject) {
      s3.getObject({
        Bucket: srcBucket,
        Key: srcKey
      }, function(err, result) {
        if (err) {
          return reject(err);
        } else if (!result || !result.hasOwnProperty('Body')) {
          return reject(new Error('Unexpected data received from s3.getObject().'));
        }
        resolve(result.Body);
      });
    });
  };

  var tasks = [fetchFromS3];
  var i;
  var num;

  if (config.mappings) {
    num = config.mappings.length;
    for (i = 0; i < num; i++) {
      if (config.mappings[i].bucket === srcBucket) {
        config.currentMapping = config.mappings[i];
        console.log('Selected mapping for S3 event:', config.currentMapping);
        break;
      }
    }
  }

  if (config.currentMapping && config.currentMapping.hasOwnProperty('processors')) {
    num = config.currentMapping.processors.length;
    for (i = 0; i < num; i++) {
      var processor = require('./handlers/' + config.currentMapping.processors[i]);
      if (processor) {
        if (processor.config) {
          processor.config(config);
        }
        tasks.push(processor.process);
      } else {
        throw new Error('Could not load processor: ' + config.currentMapping.processors[i]);
      }
    }
  }

  if (tasks.length < 2) {
    console.log('S3 event did not match any mappings.');
    return callback(null, 'S3 event did not match any mappings.');
  }

  console.log('Starting to run processor tasks...');

  var promiseSeries = function(promises) {
    var p = Promise.resolve();
    return promises.reduce(function(previous, fn) {
      return previous.then(fn);
    }, p);
  };

  promiseSeries(tasks)
    .then(function() {
      console.log('Successfully shipped data!');
      callback(null, 'Successfully shipped data!');
    })
    .catch(function(err) {
      console.error('Error occurred while preparing to ship data:', err);
      context.fail('Error occurred while preparing to ship data');
    });
};
