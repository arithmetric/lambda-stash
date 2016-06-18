/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/formatConfig");

describe('handler/formatConfig.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync(
        "test/assets/config.source.json"));
      dataJson = JSON.parse(fs.readFileSync(
        "test/assets/config.format.json"));
    });

    it('should format parsed Config data',
      function(done) {
        var config = {
          data: dataSource,
          dateField: 'date',
          setting: true
        };
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.deepStrictEqual(result.data, dataJson,
              'Config data formatted successfully');
            done();
          });
      });

    it('should fail if malformed Config data is provided',
      function(done) {
        var config = {
          data: dataJson,
          dateField: 'date',
          setting: true
        };
        handler.process(config)
          .catch(function(err) {
            assert.ok(err, 'error is thrown');
            done();
          });
      });
  });
});
