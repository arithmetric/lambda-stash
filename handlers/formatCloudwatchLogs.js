var _ = require('lodash');

exports.process = function(config) {
  console.log('formatCloudwatchLogs');
  if (!config.data ||
      !config.data.hasOwnProperty('logEvents') ||
      _.isNil(config.data.logEvents.length)) {
    return Promise.reject('Received unexpected AWS Cloudwatch Logs format:' +
      JSON.stringify(config.data));
  }

  var items = [];
  var num = config.data.logEvents.length;
  var i;
  var item;
  var parts;
  for (i = 0; i < num; i++) {
    item = config.data.logEvents[i];

    parts = item.message.match(/^(\w+)/);
    if (parts && parts[1] === 'START') {
      item.logType = 'start';
      parts = item.message.match(/^START RequestId: ([a-z0-9-]+) Version: (\S+)/); // eslint-disable-line max-len
      if (parts && parts.length === 3) {
        item.requestId = parts[1];
        item.lambdaVersion = parts[2];
      }
    } else if (parts && parts[1] === 'REPORT') {
      item.logType = 'report';
      parts = item.message.match(/^REPORT RequestId: ([a-z0-9-]+)\tDuration: ([0-9.]+) ms\tBilled Duration: ([0-9.]+) ms \tMemory Size: ([0-9.]+) MB\tMax Memory Used: ([0-9.]+)/); // eslint-disable-line max-len
      if (parts && parts.length === 6) {
        item.requestId = parts[1];
        item.duration = parts[2];
        item.durationBilled = parts[3];
        item.memConfigured = parts[4];
        item.memUsed = parts[5];
      }
    } else if (parts && parts[1] === 'END') {
      item.logType = 'end';
      parts = item.message.match(/^END RequestId: ([a-z0-9-]+)/);
      if (parts && parts[1]) {
        item.requestId = parts[1];
      }
    } else {
      item.logType = 'message';

      // Python example:
      // [INFO] 2017-06-13T10:54:39.503Z b29b4907-5026-11e7-855f-59ffc1dcaf21 Foo bar
      // NodeJS example:
      // 2017-06-13T10:57:52.368Z 25366d69-5027-11e7-9457-fd093c196800 Foo bar
      parts = item.message.match(/^(?:\[(\w+)\]\t)?(.*)\t(.*)\t(.*)$/m);
      if (parts && parts.length === 5) {
        item.logLevel = parts[1];
        item.requestId = parts[3];
        item.message = parts[4];
      }
    }

    if (config.dateField && config.dateField !== 'timestamp') {
      item[config.dateField] = new Date(item.timestamp).toISOString();
    }
    items.push(item);
  }
  config.data = items;
  return Promise.resolve(config);
};
