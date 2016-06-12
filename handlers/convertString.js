var config;

exports.config = function(_config) {
  config = _config;
};

exports.process = function(items) {
  console.log('convertString::process');

  var num = items.length;
  var i;
  var data = '';
  var key;
  var keyStr;

  for (i = 0; i < num; i++) {
    if (config.currentMapping.string && config.currentMapping.string.prefix) {
      data += config.currentMapping.string.prefix + ' ';
    }

    for (key in items[i]) {
      if (items[i].hasOwnProperty(key)) {
        keyStr = key.replace('-', '_').replace(/\W/g, '');
        data += keyStr + '="' + items[i][key] + '" ';
      }
    }

    if (config.currentMapping.string && config.currentMapping.string.suffix) {
      data += ' ' + config.currentMapping.string.suffix;
    }

    data += '\n';
  }

  return Promise.resolve(data);
};
