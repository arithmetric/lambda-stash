var config;

exports.config = function(_config) {
  config = _config;
};

exports.process = function(rows) {
  console.log('formatCloudfront::process');

  var output = [];
  var fields = [];
  var numRows = rows.length;
  var numCols;
  var i;
  var j;
  var row;
  var item;
  var label;

  for (i = 0; i < numRows; i++) {
    row = rows[i];
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
      if (config.currentMapping.dateField === 'date') {
        item.originalDate = item.date;
      }
      if (config.currentMapping.dateField) {
        item[config.currentMapping.dateField] = item.date + 'T' + item.time;
      }
      output.push(item);
    }
  }

  return Promise.resolve(output);
};
