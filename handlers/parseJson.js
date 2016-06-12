exports.process = function(item) {
  console.log('parseJson::process');
  var data;
  try {
    data = JSON.parse(item.toString());
  } catch (err) {
    return Promise.reject('Unable to parse JSON: ' + err);
  }
  return Promise.resolve(data);
};
