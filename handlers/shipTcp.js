var config;
const net = require('net');

exports.config = function(_config) {
  config = _config;
};

exports.process = function(data) {
  console.log('shipTcp::process');

  var finished = false;
  return new Promise(function(resolve, reject) {
    var client = net.connect(config.tcp.port, config.tcp.host, function() {
      client.write(data, function() {
        finished = true;
        client.end();
        resolve(data);
      });
    });
    client.on('close', function() {
      if (!finished) {
        reject('Socket closed unexpectedly.');
      }
    });
  });
};
