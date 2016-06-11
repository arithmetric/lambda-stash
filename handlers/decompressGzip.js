var zlib = require('zlib');

exports.process = function(item, next) {
  console.log('decompressGzip::process');
  zlib.gunzip(item, next);
};
