var config;

exports.setConfig = function(_config) {
  config = _config;
};

exports.handler = function(event, context, callback) {
  config.S3 = {
    srcBucket: event.Records[0].s3.bucket.name,
    srcKey: event.Records[0].s3.object.key
  };
  console.log('Handling event for s3://' + config.S3.srcBucket + '/' + config.S3.srcKey);

  var taskNames = ['getS3Object'];
  var tasks = [];
  var i;
  var num;

  if (config.mappings) {
    num = config.mappings.length;
    for (i = 0; i < num; i++) {
      if (config.mappings[i].bucket === config.S3.srcBucket) {
        config.currentMapping = config.mappings[i];
        if (config.currentMapping && config.currentMapping.hasOwnProperty('processors')) {
          taskNames = taskNames.concat(config.currentMapping.processors);
        }
        console.log('Selected mapping for S3 event:', config.currentMapping);
        break;
      }
    }
  }

  num = taskNames.length;

  if (num < 2) {
    console.log('S3 event did not match any mappings.');
    return callback(null, 'S3 event did not match any mappings.');
  }

  for (i = 0; i < num; i++) {
    var processor = require('./handlers/' + taskNames[i]);
    if (processor) {
      if (processor.config) {
        processor.config(config);
      }
      tasks.push(processor.process);
    } else {
      throw new Error('Could not load processor: ' + taskNames[i]);
    }
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
