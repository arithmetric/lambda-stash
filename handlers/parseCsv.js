var parse = require('csv-parse');

exports.process = function(config) {
  console.log('parseCsv::process');
  return new Promise(function(resolve, reject) {
    parse(config.data, {
      relax_column_count: true,
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
