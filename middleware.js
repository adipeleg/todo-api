var cryptojs = require('crypto-js');
module.exports = function (db) {

	return{
		requireAuthentication: function (req, res, next) {
			var token = req.get('Auth') || '';  

			db.token.findOne({  //lookin for the token in the databse (the value is the hashed value)
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then(function (tokenInstance){
				if(!tokenInstance){
					throw new Error();
				}

				req.token = tokenInstance;  //found the token. find the user with this token
				return db.user.findByToken(token);
			}).then( function(user){  
				req.user = user;   
				next();
			}).catch(function(){
				res.status(401).send();
			});
		}
	};
};