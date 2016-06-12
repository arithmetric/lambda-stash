var config;

exports.config = function(_config) {
  config = _config;
};

exports.process = function(data) {
  console.log('formatCloudtrail::process');

  if (!data || !data.hasOwnProperty('Records') || (!data.Records.length && data.Records.length !== 0)) {
    return Promise.reject('Received unexpected CloudTrail JSON format:' + JSON.stringify(data));
  }

  var items = [];
  var num = data.Records.length;
  var i;
  var item;
  for (i = 0; i < num; i++) {
    item = data.Records[i];
    if (config.currentMapping.dateField && config.currentMapping.dateField !== 'eventTime') {
      item[config.currentMapping.dateField] = item.eventTime;
    }
    items.push(item);
  }

  return Promise.resolve(items);
};
