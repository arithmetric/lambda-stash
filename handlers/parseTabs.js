var parse = require('csv-parse');

exports.process = function(item) {
  console.log('parseTabs::process');
  return new Promise(function(resolve, reject) {
    parse(item, {
      delimiter: '\t',
      relax_column_count: true,
      trim: true
    }, function(err, data) {
      if (err) {
        return reject(err);
      }
      resolve(data);
    });
  });
};
