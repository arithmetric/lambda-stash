var zlib = require('zlib');

exports.process = function(item) {
  console.log('decompressGzip::process');
  return new Promise(function(resolve, reject) {
    zlib.gunzip(item, function(err, result) {
      if (err) {
        return reject(err);
      }
      return resolve(result);
    });
  });
};
