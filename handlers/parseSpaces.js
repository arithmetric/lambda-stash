var parse = require('csv-parse');

exports.process = function(config) {
  console.log('parseSpaces');
  return new Promise(function(resolve, reject) {
    parse(config.data, {
      delimiter: ' ',
      relax_column_count: true, // eslint-disable-line camelcase
      trim: true
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      config.data = data;
      resolve(config);
    });
  });
};
