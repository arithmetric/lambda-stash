exports.process = function(config) {
  console.log('formatS3access for S3 hosted application logs');
  if (!config.data ||
      (!config.data.length && config.data.length !== 0)) {
    return Promise.reject('Received unexpected S3 log format:' +
      JSON.stringify(config.data));
  }

  var output = [];
  var fields = [
    'bucket_owner',
    'bucket',
    'time',
    'zone',
    'remote_ip',
    'requester',
    'request_id',
    'operation',
    'key',
    'request_uri',
    'http_status',
    'error_code',
    'bytes_sent',
    'object_size',
    'total_time',
    'turn_around_time',
    'referrer',
    'user_agent',
    'version_id',
    'host_id',
    'signature_version',
    'cipher_suite',
    'authentication_type',
    'host_header',
    'tls_version'
  ];
  var numRows = config.data.length;
  var numCols;
  var i;
  var j;
  var row;
  var item;

  for (i = 0; i < numRows; i++) {
    row = config.data[i];
    if (row.length !== 25) {
      console.log('Expected 25 columns in row. Found ' + row.length + ': ' +
        config.data[i]);
    }

    item = {};
    numCols = Math.min(row.length, fields.length);
    for (j = 0; j < numCols; j++) {
      item[fields[j]] = row[j];
    }
    item.time = item.time.replace(/\:/,' ').replace(/\[/,'');
    item.zone = item.zone.replace(/\]/,'');
    item[config.dateField] = new Date(item.time + item.zone);
    
    output.push(item);
  }
  config.data = output;
  return Promise.resolve(config);
};