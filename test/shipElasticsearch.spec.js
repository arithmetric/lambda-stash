/* global beforeEach, describe, it */

var assert = require("assert");

var handler;

describe('handler/shipElasticsearch.js', function() {
  describe('#process()', function() {
    beforeEach(function() {
      // Clear the module cache to reset overridden functions.
      delete require.cache[require.resolve('../handlers/shipElasticsearch')];
      handler = require('../handlers/shipElasticsearch');
    });

    it('should split data by the maxChunkSize',
      function(done) {
        var passVal1 = false;
        var passVal2 = false;
        var es = require('elasticsearch');
        es.Client = function(config) {
          assert.strictEqual(config.host, 'http://mock', 'host param provided');
          return {
            bulk: function(params, callback) {
              if (params.body[1].value === '1') {
                passVal1 = true;
              } else if (params.body[1].value === '2') {
                passVal2 = true;
              }
              callback(null, {errors: false});
            }
          };
        };
        var config = {
          elasticsearch: {
            host: 'http://mock',
            index: 'index',
            type: 'type',
            maxChunkSize: 1
          },
          data: [
            {
              value: '1'
            },
            {
              value: '2'
            }
          ],
          test: 'test'
        };
        handler.process(config)
          .then(function(result) {
            assert.ok(passVal1, 'chunk 1 shipped');
            assert.ok(passVal2, 'chunk 2 shipped');
            assert.strictEqual(result.test, 'test', 'config data returned');
            done();
          });
      });

    it('should accept configuration for AWS Elasticsearch',
      function(done) {
        var config = {
          elasticsearch: {
            index: 'index',
            type: 'type',
            useAWS: true,
            region: 'us-east-1',
            accessKey: 'access_key',
            secretKey: 'shh_secret',
            requestTimeout: 90000
          },
          data: [
            {
              value: '1'
            },
            {
              value: '2'
            }
          ],
          test: 'test'
        };
        var es = require('elasticsearch');
        es.Client = function(config) {
          assert.strictEqual(config.amazonES.region, 'us-east-1',
            'region param provided');
          assert.strictEqual(config.amazonES.accessKey, 'access_key',
            'key param provided');
          assert.strictEqual(config.amazonES.secretKey, 'shh_secret',
            'secret param provided');
          assert.strictEqual(config.requestTimeout, 90000,
            'request timeout param provided');
          done();
        };
        handler.process(config);
      });

    it('should allow using AWS environment credentials',
      function(done) {
        var config = {
          elasticsearch: {
            index: 'index',
            type: 'type',
            useAWS: true,
            region: 'us-east-1'
          },
          data: [
            {
              value: '1'
            }
          ],
          test: 'test'
        };
        var es = require('elasticsearch');
        es.Client = function(config) {
          assert.strictEqual(config.amazonES.credentials.envPrefix, 'AWS',
            'environment credentials provided');
          assert.strictEqual(config.amazonES.region, 'us-east-1',
            'region param provided');
          done();
        };
        handler.process(config);
      });

    it('should fail if Elasticsearch bulk results have an error',
      function(done) {
        var es = require('elasticsearch');
        es.Client = function() {
          return {
            bulk: function(params, callback) {
              callback(null, {errors: true});
            }
          };
        };
        var config = {
          elasticsearch: {
            index: 'index',
            type: 'type'
          },
          data: [
            {
              value: '1'
            }
          ]
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error is thrown');
            done();
          });
      });

    it('should fail if Elasticsearch bulk post throws an error',
      function(done) {
        var es = require('elasticsearch');
        es.Client = function() {
          return {
            bulk: function(params, callback) {
              callback(new Error('test error'));
            }
          };
        };
        var config = {
          elasticsearch: {
            index: 'index',
            type: 'type'
          },
          data: [
            {
              value: '1'
            }
          ]
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error is thrown');
            done();
          });
      });
  });
});
