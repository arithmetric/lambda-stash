var _ = require('lodash');

exports.process = function(config) {
  console.log('formatConfig');



  if (!config.data ||
      !config.data.hasOwnProperty('configurationItems') ||
      _.isNil(config.data.configurationItems.length)) {
    return Promise.reject('Received unexpected AWS Config JSON format:' +
      JSON.stringify(config.data));
  }

  var items = [];
  var num = config.data.configurationItems.length;
  var i;
  var item;
  for (i = 0; i < num; i++) {
    item = config.data.configurationItems[i];
    if (config.dateField && config.dateField !== 'resourceCreationTime') {
      item[config.dateField] = item.resourceCreationTime;
    }
    items.push(item);
  }
  config.data = items;
  return Promise.resolve(config);
};
