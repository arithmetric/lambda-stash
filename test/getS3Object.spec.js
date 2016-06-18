/* global describe, it */

var assert = require("assert");

var handler = require("../handlers/getS3Object");

describe('handler/getS3Object.js', function() {
  describe('#process()', function() {
    it('should return data for an S3 key',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              if (params.Bucket === 'source-bucket' &&
                  params.Key === 'source/key') {
                callback(null, {Body: 'successful-response'});
              }
            }
          };
        };
        var config = {
          S3: {
            srcBucket: 'source-bucket',
            srcKey: 'source/key'
          }
        };
        handler.process(config)
          .then(function(result) {
            assert.strictEqual(result.data, 'successful-response',
              'S3.getObject() returned data successfully');
            done();
          });
      });

    it('should fail if S3.getObject() returns an error',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              callback(new Error('test error'));
            }
          };
        };
        var config = {
          S3: {
            srcBucket: 'source-bucket',
            srcKey: 'source/key'
          }
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error was thrown and caught');
            done();
          });
      });

    it('should fail if S3.getObject() returns unexpected data',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              callback(null, 'malformed data');
            }
          };
        };
        var config = {
          S3: {
            srcBucket: 'source-bucket',
            srcKey: 'source/key'
          }
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error was thrown and caught');
            done();
          });
      });
  });
});
