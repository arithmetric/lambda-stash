var _ = require('lodash');

var config;

exports.setConfig = function(_config) {
  config = _config;
};

exports.handler = function(event, context, callback) {
  config.S3 = {
    srcBucket: event.Records[0].s3.bucket.name,
    srcKey: event.Records[0].s3.object.key
  };
  console.log('Handling event for s3://' + config.S3.srcBucket + '/' +
    config.S3.srcKey);

  var taskNames = ['getS3Object'];
  var tasks = [];
  var i;
  var num;
  var currentMapping;

  if (config.mappings) {
    num = config.mappings.length;
    for (i = 0; i < num; i++) {
      if (config.mappings[i].bucket === config.S3.srcBucket) {
        currentMapping = config.mappings[i];
        if (currentMapping && currentMapping.hasOwnProperty('processors')) {
          taskNames = taskNames.concat(currentMapping.processors);
        }
        console.log('Selected mapping for S3 event:', currentMapping);
        config = _.merge({}, config, currentMapping);
        break;
      }
    }
    delete config.mappings;
  }

  num = taskNames.length;

  if (num < 2) {
    console.log('S3 event did not match any mappings.');
    return callback(null, 'S3 event did not match any mappings.');
  }

  for (i = 0; i < num; i++) {
    var processor = require('./handlers/' + taskNames[i]);
    if (processor) {
      tasks.push(processor.process);
    } else {
      throw new Error('Could not load processor: ' + taskNames[i]);
    }
  }

  console.log('Starting to run processor tasks...');

  var promiseSeries = function(promises, initValue) {
    return promises.reduce(function(chain, promise) {
      return chain.then(promise);
    }, Promise.resolve(initValue));
  };

  promiseSeries(tasks, config)
    .then(function(/* config */) {
      console.log('Successfully shipped data!');
      callback(null, 'Successfully shipped data!');
    })
    .catch(function(err) {
      console.error('Error occurred while preparing to ship data:', err);
      context.fail('Error occurred while preparing to ship data');
    });
};
