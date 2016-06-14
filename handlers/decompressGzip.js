var zlib = require('zlib');

exports.process = function(config) {
  console.log('decompressGzip');
  return new Promise(function(resolve, reject) {
    zlib.gunzip(config.data, function(err, result) {
      if (err) {
        return reject(err);
      }
      config.data = result.toString();
      return resolve(config);
    });
  });
};
