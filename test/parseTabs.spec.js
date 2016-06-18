/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/parseTabs");

describe('handler/parseTabs.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = fs.readFileSync("test/assets/tabs.source.txt");
      dataJson = JSON.parse(fs.readFileSync("test/assets/table.json"));
    });

    it('should parse tab separated data',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.deepStrictEqual(result.data, dataJson,
              'tab separated data parsed successfully');
            done();
          });
      });

    it('should fail if malformed tab separated data is provided',
      function(done) {
        handler.process({data: dataJson})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed tab separated data');
            done();
          });
      });
  });
});
