exports.process = function(config) {
  console.log('shipElasticsearch');
  return new Promise(function(resolve, reject) {
    var esConfig = {
      host: config.elasticsearch.host
    };
    if (config.elasticsearch.useAWS) {
      esConfig.connectionClass = require('http-aws-es');
      esConfig.amazonES = {
        region: config.elasticsearch.region
      };
      if (config.elasticsearch.useEnvCreds) {
        var AWS = require('aws-sdk');
        esConfig.amazonES.credentials = new AWS.EnvironmentCredentials('AWS');
      } else if (config.elasticsearch.accessKey &&
          config.elasticsearch.secretKey) {
        esConfig.amazonES.accessKey = config.elasticsearch.accessKey;
        esConfig.amazonES.secretKey = config.elasticsearch.secretKey;
      }
    }
    var es = require('elasticsearch').Client(esConfig); // eslint-disable-line new-cap
    var num = config.data.length;
    var i;
    var docs = [];
    for (i = 0; i < num; i++) {
      docs.push({
        index: {
          _index: config.elasticsearch.index,
          _type: config.elasticsearch.type
        }
      });
      docs.push(config.data[i]);
    }
    console.log('Preparing to ship ' + num + ' records to Elasticsearch.');
    es.bulk({body: docs}, function(err /* , result */) {
      return (err) ? reject(err) : resolve(config);
    });
  });
};
