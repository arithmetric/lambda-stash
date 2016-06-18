/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/formatCloudfront");

describe('handler/formatCloudfront.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync(
        "test/assets/cloudfront.source.json"));
      dataJson = JSON.parse(fs.readFileSync(
        "test/assets/cloudfront.format.json"));
    });

    it('should format parsed Cloudfront data',
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
              'Cloudfront data formatted successfully');
            done();
          });
      });
  });
});
