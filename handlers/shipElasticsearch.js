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
    if (config.elasticsearch.accessKey &&
        config.elasticsearch.secretKey) {
      esConfig.amazonES.accessKey = config.elasticsearch.accessKey;
      esConfig.amazonES.secretKey = config.elasticsearch.secretKey;
    } else {
      var AWS = require('aws-sdk');
      esConfig.amazonES.credentials = new AWS.EnvironmentCredentials('AWS');
    }
  }

  var es = require('elasticsearch').Client(esConfig); // eslint-disable-line new-cap
  var docs = [];
  var maxChunkSize = config.elasticsearch.maxChunkSize || 1000;
  var promises = [];

  var ship = function(docs) {
    console.log('Preparing to ship ' + (docs.length / 2) +
      ' records to Elasticsearch.');
    return new Promise(function(resolve, reject) {
      es.bulk({body: docs}, function(err, result) {
        if (err) {
          return reject(err);
        } else if (result.errors) {
          return reject(result);
        }
        resolve();
      });
    });
  };

  _.forEach(config.data, function(datum) {

    var indexName = config.elasticsearch.index;

    // if date is available, build dynamic index: [index]-YYYY.MM.DD
    if (config.dateField) {
      var timestamp = new Date(datum[config.dateField]);
      indexName = [
        indexName + '-' + timestamp.getUTCFullYear(),    // year
        ('0' + (timestamp.getUTCMonth() + 1)).slice(-2), // month
        ('0' + timestamp.getUTCDate()).slice(-2)         // day
      ].join('.');
    }

    docs.push({
      index: {
        _index: indexName,
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
