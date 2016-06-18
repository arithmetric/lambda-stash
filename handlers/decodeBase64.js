exports.process = function(config) {
  console.log('decodeBase64');
  config.data = new Buffer(config.data, 'base64');
  return config;
};
