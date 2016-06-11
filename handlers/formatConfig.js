var config;

exports.config = function(_config) {
  config = _config;
};

exports.process = function(data, next) {
  console.log('formatConfig::process');

  if (!data || !data.hasOwnProperty('configurationItems') || (!data.configurationItems.length && data.configurationItems.length !== 0)) {
    return next('Received unexpected AWS Config JSON format:' + JSON.stringify(data));
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

  next(null, items);
};
