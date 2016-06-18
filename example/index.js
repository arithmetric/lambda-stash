var shipper = require('lambda-stash');

exports.handler = function(event, context, callback) {
  var config = {
    elasticsearch: {
      host: 'https://search-abcdefghi.us-west-2.es.amazonaws.com',
      index: 'logs',
      region: 'us-west-2',
      useAWS: true
    },
    mappings: [
      {
        bucket: 'my-cloudtrail-logs',
        processors: [
          'decompressGzip',
          'parseJson',
          'formatCloudtrail',
          'shipElasticsearch'
        ],
        elasticsearch: {
          type: 'cloudtrail'
        },
        dateField: 'date'
      },
      {
        bucket: 'my-cloudfront-logs',
        processors: [
          'decompressGzip',
          'parseTabs',
          'formatCloudfront',
          'shipElasticsearch'
        ],
        elasticsearch: {
          type: 'cloudfront'
        },
        dateField: 'date'
      }
    ]
  };
  shipper.handler(config, event, context, callback);
};
