exports.process = function(config) {
  console.log('formatELB');
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
  var label;

  for (i = 0; i < numRows; i++) {
    row = config.data[i];
    numCols = row.length;
    if (numCols !== 15) {
      console.log('Expected 15 columns in row. Found ' + numCols + ': ' +
        row.join(' '));
    }

    item = {};
    for (j = 0; j < numCols; j++) {
      label = (j < fields.length) ? fields[j] : String(j);
      item[label] = row[j];
    }
    if (config.dateField && config.dateField !== 'timestamp') {
      item[config.dateField] = item.timestamp;
    }
    output.push(item);
  }
  config.data = output;
  return Promise.resolve(config);
};
