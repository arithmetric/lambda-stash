var aws = require('aws-sdk');
var config;
var s3 = new aws.S3();

exports.config = function(_config) {
  config = _config;
};

exports.process = function() {
  console.log('getS3Object::process');

  return new Promise(function(resolve, reject) {
    s3.getObject({
      Bucket: config.S3.srcBucket,
      Key: config.S3.srcKey
    }, function(err, result) {
      if (err) {
        return reject(err);
      } else if (!result || !result.hasOwnProperty('Body')) {
        return reject('Unexpected data received from s3.getObject().');
      }
      resolve(result.Body);
    });
  });
};
