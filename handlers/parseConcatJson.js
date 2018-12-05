exports.process = function(config) {
  console.log('parseConcatJson');
  return new Promise(function(resolve, reject) {

  try {
    var sanitized = '[' + config.data.replace(/}{/g, '},{') + ']';
    config.data = JSON.parse(sanitized);
    console.log("Parsed Concat JSON Objects " + config.data.length + " from size " + sanitized.length)
  } catch (err) {
    return reject('Unable to parse JSON: ' + err);
  }
  return resolve(config);

  });
};