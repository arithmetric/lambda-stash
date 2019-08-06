/* global describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/parseSpaces");

describe('handler/parseSpaces.js', function() {
  describe('#process()', function() {
    var dataSource;
    var dataJson;

    it('should parse space separated ELBv2 data',
      function(done) {
        dataSource = fs.readFileSync("test/assets/elbv2.source.txt");
        dataJson = JSON.parse(fs.readFileSync("test/assets/elbv2.parse.json"));
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

    it('should parse space separated S3 log data',
      function(done) {
        dataSource = fs.readFileSync("test/assets/s3access.source.txt");
        dataJson =
          JSON.parse(fs.readFileSync("test/assets/s3access.parse.json"));
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
