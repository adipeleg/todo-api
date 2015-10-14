var bcryptjs = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

module.exports = function(sequelize, DataTypes) {
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true, //makes shure that this value is different for each user
			validate: {
				isEmail: true //check that this is an email
			}
		},
		salt: { //add rendom set of characters to the end of the password before it hashed- even if we have the same password will make shure you wont know the hash
			type: DataTypes.STRING
		},
		password_hash: {
			type: DataTypes.STRING
		},
		password: {
			//type: DataTypes.STRING,
			type: DataTypes.VIRTUAL, //password is not in the database
			allowNull: false,
			validate: {
				len: [7, 100]
			},
			set: function(value) {
				var salt = bcryptjs.genSaltSync(10);
				var hashedPassword = bcryptjs.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	}, {
		hooks: {
			beforeValidate: function(user, options) {
				if (typeof user.email === 'string') {
					user.email = user.email.toLowerCase();
				}
			}
		},
		classMethods: {
			authenticate: function(body) {
				return new Promise(function(resolve, reject) {
					if (typeof body.email !== 'string' || typeof body.password !== 'string') {
						return reject();
					}

					//db.user.findOne - return the user - find it using the email
					user.findOne({
						where: {
							email: body.email
						}
					}).then(function(user) {
						if (!user || !bcryptjs.compareSync(body.password, user.get('password_hash'))) { //get the user and check that the password he gave is equel to the on in the sqlite after adding the salt
							return reject();
						}
						resolve(user);
					}, function(e) {
						return reject();
					});
				});
			},
			findByToken: function(token) {
				return new Promise(function(resolve, reject) {
					try {
						var decodedJWT = jwt.verify(token, 'qwerty098');
						var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123!#$');
						var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8)); //this is th eoriginal data!

						user.findById(tokenData.id).then(function(user){
							if(user){
								resolve(user);
							}else{
								reject();
							}
						}, function (e){
							reject();
						})
					} catch (e) {
						reject();
					}
				});
			}
		},
		instanceMethods: { //warking on an existing user object
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			},
			generateToken: function(type) {
				if (!_.isString(type)) {
					return undefined;
				}

				try {
					var stringData = JSON.stringify({
						id: this.get('id'),
						type: type
					});
					var encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!#$').toString();
					var token = jwt.sign({
						token: encryptedData
					}, 'qwerty098');

					return token;
				} catch (e) {
					return undefined;
				}
			}
		}
	});
	return user;
}