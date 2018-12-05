exports.process = function(config) {
  console.log('configFromS3Key');
  return new Promise(function(resolve, reject) {

    key = config.S3.srcKey
    tag = config.tagpath.pattern

    tags = tag.split('/')
    values = key.split('/')


    if ( config.tagpath["preProcess"] ) {
        config.tagpath["preProcess"](config)
    }
    for (var i = 0; i < tags.length; i++) {
        tag = tags[i]
        // Can have empty tag path you don't care to process
        if (tag != "") {
            config[tag] = config.tagpath[tag](config, values[i])
        }
    }
    if ( config.tagpath["postProcess"] ) {
        config.tagpath["postProcess"](config)
    }

    return resolve(config);

  });
};