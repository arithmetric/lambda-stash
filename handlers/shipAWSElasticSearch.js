var es;
var config = {};

exports.config = function(_config) {
  config = _config;
  es = require('elasticsearch').Client({
    hosts: config.esHost,
    connectionClass: require('http-aws-es'),
    amazonES: {
      region: config.awsRegion,
      accessKey: config.accessKey,
      secretKey: config.secretKey
    }
  });
};

exports.process = function(items, next) {
  console.log('shipAWSElasticSearch::process');
  var num = items.length;
  var i;
  var docs = [];
  for (i = 0; i < num; i++) {
    docs.push({index: {_index: config.currentMapping.index, _type: config.currentMapping.type}});
    docs.push(items[i]);
  }
  console.log('Preparing to ship ' + num + ' records to ElasticSearch.');
  es.bulk({body: docs}, next);
};
