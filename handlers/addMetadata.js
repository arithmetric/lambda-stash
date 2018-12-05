
exports.process = function(config) {
  console.log('addMetadata');
  return new Promise(function(resolve, reject) {

    config.data.forEach( function(item) {
        for ( var i = 0 ; i < config.metadata.length; i++ ) {
            config.metadata[i](config, item)
        }
    })

    return resolve(config);

  });
};