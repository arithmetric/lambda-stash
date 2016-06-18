exports.process = function(config) {
  console.log('formatCloudfront');
  var output = [];
  var fields = [];
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
    if (numCols === 1) {
      row = row[0];
      var pos = row.indexOf('#Fields: ');
      if (pos !== -1) {
        row = row.substr(pos + 9);
        fields = row.split(" ");
      }
    } else if (numCols) {
      item = {};
      for (j = 0; j < numCols; j++) {
        label = (j < fields.length) ? fields[j] : String(j);
        item[label] = row[j];
      }
      if (config.dateField) {
        if (config.dateField === 'date') {
          item.originalDate = item.date;
        }
        item[config.dateField] = item.date + 'T' + item.time;
      }
      output.push(item);
    }
  }
  config.data = output;
  return Promise.resolve(config);
};
