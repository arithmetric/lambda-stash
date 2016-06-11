var parse = require('csv-parse');

exports.process = function(item, next) {
  console.log('parseCsv::process');
  parse(item, {
    relax_column_count: true,
    trim: true
  }, next);
};
