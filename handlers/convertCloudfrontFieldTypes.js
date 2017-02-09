exports.process = function(config) {
  console.log('convertCloudfrontFieldTypes');

  var records = config.data;

  for (var i = 0; i < records.length; i++) {
    var record = records[i];

    record['sc-bytes'] = parseInt(record['sc-bytes']);
    record['sc-status'] = parseInt(record['sc-status']);
    record['cs-bytes'] = parseInt(record['cs-bytes']);
    record['time-taken'] = parseFloat(record['time-taken']);
  }

  return Promise.resolve(config);
};
