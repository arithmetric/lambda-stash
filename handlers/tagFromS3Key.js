
exports.process = function(config) {
    console.log('tagFromS3Key');

    key = config.S3.srcKey
    tag = config.tagpath.pattern

    tags = tag.split('/')
    values = key.split('/')

    for (var i = 0; i < tags.length; i++) {
        tag = tags[i]
        if (tag != "") {
            config[tag] = values[i]
        }
    }

    config.data.forEach( function(item) {
      for (var i = 0; i < tags.length; i++) {
          tag = tags[i]
          if (tag != "") {
              config.tagpath[tag](config, item, values[i])
          }
      }
    })

    return Promise.resolve(config);
}
