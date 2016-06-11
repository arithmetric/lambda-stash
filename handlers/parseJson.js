exports.process = function(item, next) {
  console.log('parseJson::process');
  var data;
  try {
      data = JSON.parse(item.toString());
  } catch (err) {
      return next('Unable to parse JSON: ' + err);
  }
  next(null, data);
};
