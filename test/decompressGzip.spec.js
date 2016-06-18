/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require("../handlers/decompressGzip");

describe('handler/decompressGzip.js', function() {
  describe('#process()', function() {
    var dataGzip;
    var dataPlain;

    before(function() {
      dataGzip = fs.readFileSync("test/assets/message.txt.gz");
      dataPlain = fs.readFileSync("test/assets/message.txt").toString();
    });

    it('should decompress gzip data',
      function(done) {
        handler.process({data: dataGzip, setting: true})
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.strictEqual(result.data, dataPlain,
              'gzipped data decompressed successfully');
            done();
          });
      });

    it('should fail if malformed gzip data is provided',
      function(done) {
        handler.process({data: dataPlain})
          .catch(function(err) {
            assert.ok(err, 'failure reported for malformed gzip data');
            done();
          });
      });
  });
});
