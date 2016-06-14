exports.process = function(config) {
  console.log('shipAWSElasticSearch');
  return new Promise(function(resolve, reject) {
    var es = require('elasticsearch').Client({ // eslint-disable-line new-cap
      hosts: config.esHost,
      connectionClass: require('http-aws-es'),
      amazonES: {
        region: config.awsRegion,
        accessKey: config.accessKey,
        secretKey: config.secretKey
      }
    });
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
    console.log('Preparing to ship ' + num + ' records to ElasticSearch.');
    es.bulk({body: docs}, function(err /* , result */) {
      return (err) ? reject(err) : resolve(config);
    });
  });
};
