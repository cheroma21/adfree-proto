
exports.index = function(req, res){
  res.render('index', { title: 'Client Website' });
};

exports.admin = function(req, res){
  res.render('admin', { title: 'Admin' });
};