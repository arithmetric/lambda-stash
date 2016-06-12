exports.process = function(items) {
  console.log('outputJsonLines::process');
  return new Promise(function(resolve /* , reject */) {
    var data = items.reduce(function(str, item) {
      return str + JSON.stringify(item) + '\n';
    }, '');
    resolve(data);
  });
};
