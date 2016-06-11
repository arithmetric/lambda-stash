exports.process = function(item) {
  console.log('parseJson::process');
  return new Promise(function(resolve, reject) {
    var data;
    try {
      data = JSON.parse(item.toString());
    } catch (err) {
      return reject('Unable to parse JSON: ' + err);
    }
    resolve(data);
  });
};
