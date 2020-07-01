/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/parseCsv");

describe('handler/parseCsv.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = fs.readFileSync("test/assets/csv.source.txt");
      dataJson = JSON.parse(fs.readFileSync("test/assets/table.json"));
    });

    it('should parse CSV data',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.deepStrictEqual(result.data, dataJson,
              'CSV data parsed successfully');
            done();
          });
      });

    it('should fail if malformed CSV data is provided',
      function(done) {
        // An unclosed quote should throw an error when processed by csv-parse.
        const badData = '"test test\t';
        handler.process({data: badData})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed CSV data');
            done();
          });
      });
  });
});
