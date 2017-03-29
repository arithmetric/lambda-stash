exports.process = function(config) {
  console.log('getS3Object');
  return new Promise(function(resolve, reject) {
    var AWS = require('aws-sdk');
    var s3 = new AWS.S3();
    s3.getObject({
      Bucket: config.S3.srcBucket,
      Key: decodeURIComponent(config.S3.srcKey)
    }, function(err, result) {
      if (err) {
        return reject(err);
      } else if (!result || !result.hasOwnProperty('Body')) {
        return reject('Unexpected data received from s3.getObject().');
      }
      config.data = result.Body;
      resolve(config);
    });
  });
};
