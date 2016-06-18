/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/parseJson");

describe('handler/parseJson.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = fs.readFileSync("test/assets/table.json");
      dataJson = JSON.parse(dataSource);
    });

    it('should parse JSON data',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.deepStrictEqual(result.data, dataJson,
              'JSON data parsed successfully');
            done();
          });
      });

    it('should fail if malformed JSON data is provided',
      function(done) {
        handler.process({data: dataJson})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed JSON data');
            done();
          });
      });
  });
});
