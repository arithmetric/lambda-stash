exports.process = function(config) {
  console.log('shipAWSElasticSearch::process');

  return new Promise(function(resolve, reject) {
    var es = require('elasticsearch').Client({
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
      docs.push({index: {_index: config.currentMapping.index, _type: config.currentMapping.type}});
      docs.push(config.data[i]);
    }
    console.log('Preparing to ship ' + num + ' records to ElasticSearch.');
    es.bulk({body: docs}, function(err /* , result */) {
      if (err) {
        return reject(err);
      }
      resolve(config);
    });
  });
};
