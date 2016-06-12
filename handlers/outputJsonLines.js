exports.process = function(config) {
  console.log('outputJsonLines::process');
  config.data = config.data.reduce(function(str, item) {
    return str + JSON.stringify(item) + '\n';
  }, '');
  return Promise.resolve(config);
};
