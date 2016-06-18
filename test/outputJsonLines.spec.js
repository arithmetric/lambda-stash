/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/outputJsonLines");

describe('handler/outputJsonLines.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = JSON.parse(fs.readFileSync("test/assets/table.json"));
      dataJson = fs.readFileSync("test/assets/table.jsonstring.txt").toString();
    });

    it('should convert arrays to lines of JSON',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.strictEqual(result.data, dataJson,
              'JSON data parsed successfully');
            done();
          });
      });

    it('should fail if a non-array value is provided',
      function(done) {
        handler.process({data: dataJson})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed JSON data');
            done();
          });
      });
  });
});
