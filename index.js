var async = require('async');
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

  var fetchFromS3 = function(next) {
    console.log('fetchFromS3');
    s3.getObject({
      Bucket: srcBucket,
      Key: srcKey
    }, function(err, result) {
      if (err) {
        return next(err);
      } else if (!result || !result.hasOwnProperty('Body')) {
        throw new Error('Unexpected data received from s3.getObject().');
      }
      next(null, result.Body);
    });
  };

  var tasks = [fetchFromS3];

  if (config.mapping.hasOwnProperty(srcBucket)) {
    config.currentMapping = config.mapping[srcBucket];
    console.log('Selected mapping:', config.currentMapping);
  }

  if (config.currentMapping && config.currentMapping.hasOwnProperty('processors')) {
    var i;
    var num = config.currentMapping.processors.length;
    for (i = 0; i < num; i++) {
      var processor = require('./handlers/' + config.currentMapping.processors[i]);
      if (processor) {
        if (processor.config) {
          processor.config(config);
        }
        tasks.push(processor.process);
      }
    }
  }

  if (tasks.length < 2) {
    console.log('S3 notification did not match any mappings.');
    return callback(null);
  }

  console.log('Starting to run processor tasks...');

  async.waterfall(tasks,
    function(err) {
      if (err) {
        console.error('Error occurred while preparing to ship data:', err);
        return context.fail('Error occurred while preparing to ship data');
      }
      console.log('Successfully shipped data!');
      callback(null, 'Successfully shipped data!');
    });
};
