var _ = require('lodash');

function getIndex(config, datanum) {
    var index;
    if ( datanum.es_doc_index ) {
        index = datanum.es_doc_index;
        delete datanum.es_doc_index;
        return index
    }
    return config.elasticsearch.index;
}
function getType(config, datanum) {
    var type;
    if ( datanum.es_doc_type ) {
        type = datanum.es_doc_type;
        delete datanum.es_doc_type;
        return type;
    }
    return config.elasticsearch.type;
}
function getId(config, datanum) {
    var id;
    if ( datanum.es_doc_id ) {
        id = datanum.es_doc_id;
        delete datanum.es_doc_id;
        return id;
    }
    return null
}

// sleep time expects milliseconds
function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}


exports.process = function(config) {
    console.log('shipElasticsearch2');

    var startTime = new Date();

    var esConfig = {
        host: config.elasticsearch.host
    };
    if (config.elasticsearch.auth) {
        esConfig.auth = config.elasticsearch.auth
    }
    if (config.elasticsearch.log) {
        console.log("adding elasticsearch log")
        esConfig.log = config.elasticsearch.log
    }
    if ( config.elasticsearch.requestTimeout) {
        esConfig.requestTimeout = config.elasticsearch.requestTimeout
    }

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

    var ship = function(docs) {
        return new Promise(function(resolve, reject) {
            // console.log('Preparing to ship ' + (docs.length / 2) +
            //     ' records to Elasticsearch.');
            es.bulk({body: docs}, function(err, result) {
                if (err) {
                    console.log("Ship Thrown Error ", err)
                    return reject(err);
                } else if (result.errors) {
                    console.log("Ship Errors ", result.errors)
                    console.log("Ship Errors Took ", result.took)
                    _.forEach(result.items, function(item) {
                        if ( item.index && item.index.status ) {
                            if ( item.index.status != 201 ) {
                                console.log("Ship Item Failed:", JSON.stringify(item))
                            }
                        } else {
                            console.log("Ship Item Failed Status:", JSON.stringify(item))
                        }
                    })
                    return reject(result);
                }
                // console.log("Shipped Chunk");
                return resolve();
            });
        });
    };

    var chunks = []
    _.forEach(config.data, function(datum) {

        values = {
            _index: getIndex(config, datum),
            _type: getType(config, datum)
        }
        id = getId(config, datum)
        if ( id ) {
            values['_id'] = id
        }

        docs.push({
            index: values
        });
        docs.push(datum);

        if ((docs.length / 2) >= maxChunkSize) {
            var chunk = docs;
            chunks.push(chunk)
            docs = [];
        }
    });
    if (docs.length) {
        chunks.push(docs)
    }

    // This is to make the es.bulk calls in sequence to avoid overloading the escluster with to many shard requests
    function workMyCollection(arr) {
      return arr.reduce((promise, item) => {
        return promise
          .then((result) => {
            return ship(item)
          })
          .catch(console.error)
      }, Promise.resolve())
    }

    return new Promise(function(resolve2, reject2) {
        workMyCollection(chunks).then(function () {
            var endTime = new Date();
            var seconds = (endTime - startTime) / 1000;
            var perSecond = config.data.length / seconds;
            console.log("RATE:", perSecond, " items/second", config.data.length, "total items in", chunks.length, "chunks");
            resolve2(config);
        });
    });
};
