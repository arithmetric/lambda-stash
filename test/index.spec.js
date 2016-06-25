/* global beforeEach, describe, it */

var assert = require("assert");
var fs = require("fs");

var index;

describe('index.js', function() {
  describe('#handler()', function() {
    beforeEach(function() {
      // Clear the module cache to reset overridden functions.
      delete require.cache;
      index = require("../index");
    });

    it('selects mapping based on S3 bucket and completes with mock',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              assert.strictEqual(params.Bucket, 'source-bucket',
                'S3.getObject invoked with correct S3 bucket');
              callback(null, {Body: '{"status": "successful-response"}'});
            }
          };
        };
        var config = {
          mappings: [
            {
              bucket: 'non-match-bucket',
              processors: [
                'parseJson'
              ]
            },
            {
              bucket: 'source-bucket',
              processors: [
                'parseJson'
              ]
            }
          ]
        };
        var event = {
          Records: [
            {
              eventSource: 'aws:s3',
              s3: {
                bucket: {
                  name: 'source-bucket'
                },
                object: {
                  key: 'source/key'
                }
              }
            }
          ]
        };
        var context;
        var callback = function(err /* , config */) {
          assert.ok(!err, 'no error is given');
          done();
        };
        index.handler(config, event, context, callback);
      });

    it('handles a CloudWatch Logs event and completes parsing',
      function(done) {
        var config = {
          mappings: [
            {
              type: 'CloudWatch',
              processors: [
                'shipElasticsearch'
              ]
            }
          ]
        };
        var dataSource = fs.readFileSync("test/assets/cloudwatch.source.txt");
        var dataJson = JSON.parse(fs.readFileSync(
          "test/assets/cloudwatch.parse.json"));
        var event = {
          awslogs: {
            data: dataSource.toString()
          }
        };
        var context;
        var callback = function() {};
        var shipElasticsearch = require('../handlers/shipElasticsearch');
        shipElasticsearch.process = function(config) {
          assert.deepStrictEqual(config.data, dataJson,
            'CloudWatch Log is parsed');
          done();
        };
        index.handler(config, event, context, callback);
      });

    it('handles a custom handler provided as a function',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              assert.strictEqual(params.Bucket, 'source-bucket',
                'S3.getObject invoked with correct S3 bucket');
              callback(null, {Body: '{"status": "successful-response"}'});
            }
          };
        };
        var ranCustomHandler = false;
        var customHandler = function(config) {
          console.log('customHandler');
          ranCustomHandler = true;
          return Promise.resolve(config);
        };
        var config = {
          mappings: [
            {
              bucket: 'source-bucket',
              processors: [
                customHandler
              ]
            }
          ]
        };
        var event = {
          Records: [
            {
              eventSource: 'aws:s3',
              s3: {
                bucket: {
                  name: 'source-bucket'
                },
                object: {
                  key: 'source/key'
                }
              }
            }
          ]
        };
        var context = {};
        var callback = function(err /* , result */) {
          assert.ok(!err, 'no error is given');
          assert.ok(ranCustomHandler, 'custom handler was run');
          done();
        };
        index.handler(config, event, context, callback);
      });

    it('throws error if a handler throws an error',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(/* params, callback */) {
              throw new Error('test error');
            }
          };
        };
        var config = {
          mappings: [
            {
              bucket: 'source-bucket'
            }
          ]
        };
        var event = {
          Records: [
            {
              eventSource: 'aws:s3',
              s3: {
                bucket: {
                  name: 'source-bucket'
                },
                object: {
                  key: 'source/key'
                }
              }
            }
          ]
        };
        var context = {
          fail: function(err) {
            assert.ok(err, 'error is thrown');
            done();
          }
        };
        var callback = function() {};
        index.handler(config, event, context, callback);
      });

    it('throws error for an invalid processor',
      function(done) {
        var AWS = require('aws-sdk');
        AWS.S3 = function() {
          return {
            getObject: function(params, callback) {
              callback(null, {Body: 'successful-response'});
            }
          };
        };
        var config = {
          mappings: [
            {
              bucket: 'source-bucket',
              processors: [
                'invalid-processor'
              ]
            }
          ]
        };
        var event = {
          Records: [
            {
              eventSource: 'aws:s3',
              s3: {
                bucket: {
                  name: 'source-bucket'
                },
                object: {
                  key: 'source/key'
                }
              }
            }
          ]
        };
        var context = {
          fail: function(err) {
            assert.ok(err, 'error is thrown');
            done();
          }
        };
        var callback = function() {};
        index.handler(config, event, context, callback);
      });

    it('ends without error if no mapping is found',
      function(done) {
        var config = {};
        var event = {
          Records: [
            {
              eventSource: 'aws:s3',
              s3: {
                bucket: {
                  name: 'source-bucket'
                },
                object: {
                  key: 'source/key'
                }
              }
            }
          ]
        };
        var context;
        var callback = function(err, result) {
          assert.ok(!err, 'no error is given');
          assert.strictEqual(result, 'Event did not match any mappings.',
            'invokes callback with status');
          done();
        };
        index.handler(config, event, context, callback);
      });
  });
});
