var bcryptjs = require('bcryptjs');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes) {
	return sequelize.define('user', {
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
		instanceMethods: {
			toPublicJSON: function() {
				var json = this.toJSON();
				return _.pick(json, 'id', 'email', 'updatedAt', 'createdAt');
			}
		}
	});
}