/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/parseSpaces");

describe('handler/parseSpaces.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    before(function() {
      dataSource = fs.readFileSync("test/assets/spaces.source.txt");
      dataJson = JSON.parse(fs.readFileSync("test/assets/table.json"));
    });

    it('should parse space separated data',
      function(done) {
        var config = {data: dataSource, setting: true};
        handler.process(config)
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.deepStrictEqual(result.data, dataJson,
              'space separated data parsed successfully');
            done();
          });
      });

    it('should fail if malformed space separated data is provided',
      function(done) {
        handler.process({data: dataJson})
          .catch(function(err) {
            assert.ok(err,
              'failure reported for malformed space separated data');
            done();
          });
      });
  });
});
