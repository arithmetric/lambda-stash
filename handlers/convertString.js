exports.process = function(config) {
  console.log('convertString');
  if (!Array.isArray(config.data)) {
    return Promise.reject('Non-array data passed to convertString.');
  }

  config.data = config.data.map(function(datum) {
    var escapeChar = config.string && config.string.escapeChar ?
      config.string.escapeChar : '\'';

    var parts = Object.entries(datum).map(function([key, value]) {
      key = String(key).replace('-', '_').replace(/\W/g, '');
      value = String(value).replace(/\n/g, ' ').replace(/"/g, escapeChar);
      return key + '="' + value + '"';
    });

    if (config.string && config.string.prefix) {
      parts.unshift(config.string.prefix);
    }

    if (config.string && config.string.suffix) {
      parts.push(config.string.suffix);
    }

    return parts.join(' ') + '\n';
  }).join('');

  return Promise.resolve(config);
};
