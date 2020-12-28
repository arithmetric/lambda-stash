/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/convertString");

describe('handler/convertString.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataString;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync("test/assets/log.json"));
      dataString = fs.readFileSync("test/assets/log.string.txt").toString();
    });

    it('should convert an array to lines of text',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.equal(result.data, dataString,
              'converted to string successfully');
            done();
          });
      });

    it('should support a configurable prefix and suffix',
      function(done) {
        var config = {
          data: dataSource,
          setting: true,
          string: {
            prefix: 'prefix',
            suffix: 'suffix'
          }
        };
        dataString = fs.readFileSync("test/assets/log.string.config.txt")
          .toString();
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.equal(result.data, dataString,
              'converted to string with prefix and suffix successfully');
            done();
          });
      });

    it('should fail if a non-array value is provided',
      function(done) {
        handler.process({data: dataString})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed JSON data');
            done();
          });
      });

    it('should escape double quote characters',
      function(done) {
        var config = {
          data: [{test: 'this is "a" test.'}],
          setting: true
        };
        dataString = "test=\"this is 'a' test.\"\n";
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.equal(result.data, dataString,
              'converted to string with prefix and suffix successfully');
            done();
          });
      });

    it('should support a configurable escape character',
      function(done) {
        var config = {
          data: [{test: 'this is "a" test.'}],
          setting: true,
          string: {
            escapeChar: 'x'
          }
        };
        dataString = "test=\"this is xax test.\"\n";
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.equal(result.data, dataString,
              'converted to string with prefix and suffix successfully');
            done();
          });
      });
  });
});
