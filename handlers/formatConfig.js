exports.process = function(config) {
  console.log('formatConfig::process');

  if (!config.data || !config.data.hasOwnProperty('configurationItems') || (!config.data.configurationItems.length && config.data.configurationItems.length !== 0)) {
    return Promise.reject('Received unexpected AWS Config JSON format:' + JSON.stringify(config.data));
  }

  var items = [];
  var num = config.data.configurationItems.length;
  var i;
  var item;
  for (i = 0; i < num; i++) {
    item = config.data.configurationItems[i];
    if (config.currentMapping.dateField && config.currentMapping.dateField !== 'resourceCreationTime') {
      item[config.currentMapping.dateField] = item.resourceCreationTime;
    }
    items.push(item);
  }
  config.data = items;
  return Promise.resolve(config);
};
