var config;

exports.config = function(_config) {
  config = _config;
};

exports.process = function(data) {
  console.log('formatConfig::process');

  return new Promise(function(resolve, reject) {
    if (!data || !data.hasOwnProperty('configurationItems') || (!data.configurationItems.length && data.configurationItems.length !== 0)) {
      return reject('Received unexpected AWS Config JSON format:' + JSON.stringify(data));
    }

    var items = [];
    var num = data.configurationItems.length;
    var i;
    var item;
    for (i = 0; i < num; i++) {
      item = data.configurationItems[i];
      if (config.currentMapping.dateField && config.currentMapping.dateField !== 'resourceCreationTime') {
        item[config.currentMapping.dateField] = item.resourceCreationTime;
      }
      items.push(item);
    }

    resolve(items);
  });
};
