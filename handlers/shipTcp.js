exports.process = function(config) {
  console.log('shipTcp');
  var finished = false;
  return new Promise(function(resolve, reject) {
    var net = require('net');
    var client = net.connect(config.tcp.port, config.tcp.host, function() {
      var keyData = config.tcp.keyData || 'data';
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
