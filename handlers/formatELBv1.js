exports.process = function(config) {
  console.log('formatELB for Classic Load Balancers');
  if (!config.data ||
      (!config.data.length && config.data.length !== 0)) {
    return Promise.reject('Received unexpected ELB log format:' +
      JSON.stringify(config.data));
  }

  var output = [];
  var fields = [
    'timestamp',
    'elb',
    'client',
    'backend',
    'request_processing_time',
    'backend_processing_time',
    'response_processing_time',
    'elb_status_code',
    'backend_status_code',
    'received_bytes',
    'sent_bytes',
    'request',
    'user_agent',
    'ssl_cipher',
    'ssl_protocol'
  ];
  var numRows = config.data.length;
  var numCols;
  var i;
  var j;
  var row;
  var item;

  for (i = 0; i < numRows; i++) {
    row = config.data[i];
    if (row.length !== 15) {
      console.log('Expected 15 columns in row. Found ' + row.length + ': ' +
        config.data[i]);
    }

    item = {};
    numCols = Math.min(row.length, fields.length);
    for (j = 0; j < numCols; j++) {
      item[fields[j]] = row[j];
    }
    if (config.dateField && config.dateField !== 'timestamp') {
      item[config.dateField] = item.timestamp;
    }
    output.push(item);
  }
  config.data = output;
  return Promise.resolve(config);
};
