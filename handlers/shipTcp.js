const net = require('net');

exports.process = function(config) {
  console.log('shipTcp::process');

  var finished = false;
  return new Promise(function(resolve, reject) {
    var client = net.connect(config.tcp.port, config.tcp.host, function() {
      var keyData = config.tcp.hasOwnProperty('keyData') ? config.tcp.keyData : 'data';
      client.write(config[keyData], function() {
        finished = true;
        client.end();
        resolve(config);
      });
    });
    client.on('close', function() {
      if (!finished) {
        reject('Socket closed unexpectedly.');
      }
    });
  });
};
