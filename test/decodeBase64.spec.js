/* global before, describe, it */

var assert = require("assert");
var fs = require("fs");

var handler = require('../handlers/decodeBase64');

describe('handler/decodeBase64.js', function() {
  describe('#process()', function() {
    var dataBase64;
    var dataPlain;

    before(function() {
      dataBase64 = fs.readFileSync("test/assets/log.string.base64.txt")
        .toString();
      dataPlain = fs.readFileSync("test/assets/log.string.txt").toString();
    });

    it('should decode Base64 data',
      function(done) {
        handler.process({data: dataBase64, setting: true})
          .then(function(result) {
            assert.ok(result.hasOwnProperty('setting'),
              'process returns config object');
            assert.strictEqual(result.data.toString(), dataPlain,
              'Base64 data decoded successfully');
            done();
          });
      });
  });
});
