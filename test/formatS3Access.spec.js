/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/formatS3Access");

describe('handler/formatS3Access.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync(
        "test/assets/s3access.parse.json"));
      dataJson = JSON.parse(fs.readFileSync(
        "test/assets/s3access.format.json"));
    });

    it('should format parsed S3 Access data',
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
              'S3 Access data formatted successfully');
            done();
          });
      });

    it('should fail if malformed S3 Access data is provided',
      function(done) {
        var config = {
          data: {malformed: 'data'},
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
