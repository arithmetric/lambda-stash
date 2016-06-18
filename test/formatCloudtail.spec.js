/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/formatCloudtrail");

describe('handler/formatCloudtrail.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync(
        "test/assets/cloudtrail.source.json"));
      dataJson = JSON.parse(fs.readFileSync(
        "test/assets/cloudtrail.format.json"));
    });

    it('should format parsed Cloudtrail data',
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
              'Cloudtrail data formatted successfully');
            done();
          });
      });

    it('should fail if malformed Cloudtrail data is provided',
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
