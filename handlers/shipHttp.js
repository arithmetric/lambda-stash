const http = require('http');
const url = require('url');

exports.process = function(config) {
  console.log('shipHttp::process');

  return new Promise(function(resolve, reject) {
    var options = url.parse(config.currentMapping.http.url);
    options.method = 'POST';

    var req = http.request(options, function(res) {
      console.log('Received HTTP response status code: ' + res.statusCode);
      resolve(config);
    });

    req.on('error', function(err) {
      reject('An error occurred when making an HTTP request: ' + err);
    });

    var keyData = config.currentMapping.http.hasOwnProperty('keyData') ? config.currentMapping.http.keyData : 'data';
    req.write(config[keyData]);
    req.end();
  });
};
