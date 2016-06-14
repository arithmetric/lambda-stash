exports.process = function(config) {
  console.log('outputJsonLines');
  try {
    config.data = config.data.reduce(function(str, item) {
      return str + JSON.stringify(item) + '\n';
    }, '');
  } catch (err) {
    return Promise.reject(err);
  }
  return Promise.resolve(config);
};
