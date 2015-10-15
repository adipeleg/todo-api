module.exports = function (db) {

	return{
		requireAuthentication: function (req, res, next) {
			var token = req.get('Auth');  
			//find the user by the token value
			db.user.findByToken(token).then(function (user) {   //this function is defined in user class
				req.user = user;
				next(); //continue for the rest of the code in post
			}, function () {
				res.status(401).send();
			});
		}
	};
};