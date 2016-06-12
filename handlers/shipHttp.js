var config;
var http = require('http');
var url = require('url');

exports.config = function(_config) {
  config = _config;
};

exports.process = function(data) {
  console.log('shipHttp::process');

  return new Promise(function(resolve, reject) {
    var options = url.parse(config.currentMapping.http.url);
    options.method = 'POST';

    var req = http.request(options, function(res) {
      console.log('Received HTTP response status code: ' + res.statusCode);
      resolve(data);
    });

    req.on('error', function(err) {
      reject('An error occurred when making an HTTP request: ' + err);
    });

    req.write(data);
    req.end();
  });
};
