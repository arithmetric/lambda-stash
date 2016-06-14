exports.process = function(config) {
  console.log('parseJson');
  try {
    config.data = JSON.parse(config.data);
  } catch (err) {
    return Promise.reject('Unable to parse JSON: ' + err);
  }
  return Promise.resolve(config);
};
