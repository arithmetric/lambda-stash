exports.process = function(config) {
  console.log('convertString::process');

  var num = config.data.length;
  var i;
  var data = '';
  var key;
  var keyStr;

  for (i = 0; i < num; i++) {
    if (config.string && config.string.prefix) {
      data += config.string.prefix + ' ';
    }

    for (key in config.data[i]) {
      if (config.data[i].hasOwnProperty(key)) {
        keyStr = key.replace('-', '_').replace(/\W/g, '');
        data += keyStr + '="' + config.data[i][key] + '" ';
      }
    }

    if (config.string && config.string.suffix) {
      data += ' ' + config.string.suffix;
    }

    data += '\n';
  }
  config.data = data;
  return Promise.resolve(config);
};
