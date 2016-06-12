exports.process = function(items) {
  console.log('outputJsonLines::process');
  var data = items.reduce(function(str, item) {
    return str + JSON.stringify(item) + '\n';
  }, '');
  return Promise.resolve(data);
};
