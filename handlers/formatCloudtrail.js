exports.process = function(config) {
  console.log('formatCloudtrail::process');

  if (!config.data || !config.data.hasOwnProperty('Records') || (!config.data.Records.length && config.data.Records.length !== 0)) {
    return Promise.reject('Received unexpected CloudTrail JSON format:' + JSON.stringify(config.data));
  }

  var items = [];
  var num = config.data.Records.length;
  var i;
  var item;
  for (i = 0; i < num; i++) {
    item = config.data.Records[i];
    if (config.dateField && config.dateField !== 'eventTime') {
      item[config.dateField] = item.eventTime;
    }
    items.push(item);
  }
  config.data = items;
  return Promise.resolve(config);
};
