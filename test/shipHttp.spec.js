/* global beforeEach, describe, it */

var assert = require("assert");

var handler;

describe('handler/shipHttp.js', function() {
  describe('#process()', function() {
    beforeEach(function() {
      // Clear the module cache to reset overridden functions.
      delete require.cache[require.resolve('../handlers/shipHttp')];
      handler = require('../handlers/shipHttp');
    });

    it('should ship data using the http module',
      function(done) {
        var http = require('http');
        var httpReqSent = false;
        var httpReqEnded = false;
        http.request = function(options, _callback) {
          var callback = _callback;
          assert.strictEqual(options.method, 'POST', 'HTTP method provided');
          assert.strictEqual(options.protocol, 'http:',
            'HTTP protocol provided');
          assert.strictEqual(options.hostname, 'mock', 'HTTP host provided');
          assert.strictEqual(options.pathname, '/logs', 'HTTP path provided');
          assert.strictEqual(options.query, 'app=abc123',
            'HTTP query provided');
          return {
            end: function() {
              httpReqEnded = true;
              callback({statusCode: 201});
            },
            on: function(event, _callback) {
              return;
            },
            write: function(data) {
              assert.strictEqual(data, 'test data 123456',
                'data written in request');
              httpReqSent = true;
            }
          };
        };
        var config = {
          http: {
            url: 'http://mock/logs?app=abc123'
          },
          data: 'test data 123456',
          test: 'test'
        };
        handler.process(config)
          .then(function(result) {
            assert.ok(httpReqSent, 'HTTP request sent');
            assert.ok(httpReqEnded, 'HTTP request closed');
            assert.strictEqual(result.test, 'test', 'config data returned');
            done();
          });
      });

    it('should fail if the HTTP request throws an error',
      function(done) {
        var http = require('http');
        http.request = function(options, _callback) {
          return {
            end: function() {
            },
            on: function(event, callback) {
              callback(new Error('test error'));
            },
            write: function(data) {
            }
          };
        };
        var config = {
          http: {
            url: 'http://mock/logs?app=abc123'
          },
          data: 'test data 123456',
          test: 'test'
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error is thrown');
            done();
          });
      });
  });
});
