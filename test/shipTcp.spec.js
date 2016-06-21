/* global beforeEach, describe, it */

var assert = require("assert");

var handler;

describe('handler/shipTcp.js', function() {
  describe('#process()', function() {
    beforeEach(function() {
      // Clear the module cache to reset overridden functions.
      delete require.cache[require.resolve('../handlers/shipTcp')];
      handler = require('../handlers/shipTcp');
    });

    it('should ship data using the net module',
      function(done) {
        var net = require('net');
        var tcpReqSent = false;
        var tcpReqEnded = false;
        net.connect = function(port, host, _callback) {
          var closeCallback;
          assert.strictEqual(port, '7654', 'TCP port provided');
          assert.strictEqual(host, 'mock', 'TCP host provided');
          process.nextTick(_callback);
          return {
            end: function() {
              tcpReqEnded = true;
              closeCallback();
            },
            on: function(event, _callback) {
              closeCallback = _callback;
            },
            write: function(data, _callback) {
              assert.strictEqual(data, 'test data 123456',
                'data written in request');
              tcpReqSent = true;
              _callback();
            }
          };
        };
        var config = {
          tcp: {
            host: 'mock',
            port: '7654'
          },
          data: 'test data 123456',
          test: 'test'
        };
        handler.process(config)
          .then(function(result) {
            assert.ok(tcpReqSent, 'TCP request sent');
            assert.ok(tcpReqEnded, 'TCP request closed');
            assert.strictEqual(result.test, 'test', 'config data returned');
            done();
          });
      });

    it('should fail if the TCP request throws an error',
      function(done) {
        var net = require('net');
        net.connect = function(port, host, _callback) {
          process.nextTick(_callback);
          return {
            end: function() {
            },
            on: function(event, _callback) {
              assert.strictEqual(event, 'close', 'TCP close event handled');
              _callback();
            },
            write: function(data, _callback) {
            }
          };
        };
        var config = {
          tcp: {
            host: 'mock',
            port: '7654'
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
