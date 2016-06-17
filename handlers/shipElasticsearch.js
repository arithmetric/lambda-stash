var _ = require('lodash');

exports.process = function(config) {
  console.log('shipElasticsearch');

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

  var es = config.drivers.ES || require('elasticsearch').Client(esConfig); // eslint-disable-line new-cap
  var docs = [];
  var maxChunkSize = config.elasticsearch.maxChunkSize || 1000;
  var promises = [];

  var ship = function(docs) {
    console.log('Preparing to ship ' + (docs.length / 2) +
      ' records to Elasticsearch.');
    return new Promise(function(resolve, reject) {
      es.bulk({body: docs}, function(err /* , result */) {
        return (err) ? reject(err) : resolve();
      });
    });
  };

  _.forEach(config.data, function(datum) {
    docs.push({
      index: {
        _index: config.elasticsearch.index,
        _type: config.elasticsearch.type
      }
    });
    docs.push(datum);

    if ((docs.length / 2) >= maxChunkSize) {
      var chunk = docs;
      promises.push(ship(chunk));
      docs = [];
    }
  });
  if (docs.length) {
    promises.push(ship(docs));
  }

  return Promise.all(promises)
    .then(function() {
      return config;
    });
};
