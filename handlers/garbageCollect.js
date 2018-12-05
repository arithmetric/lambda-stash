exports.process = function(config) {
  return new Promise(function(resolve, reject) {
    if (global.gc) {
        global.gc();
    } else {
    console.log('Garbage collection unavailable.  Pass --expose-gc '
      + 'when launching node to enable forced garbage collection.');
    }
    resolve(config)
  });
};