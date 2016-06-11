var parse = require('csv-parse');

exports.process = function(item, next) {
  console.log('parseTabs::process');
  parse(item, {
    delimiter: '\t',
    relax_column_count: true,
    trim: true
  }, next);
};
