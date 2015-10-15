//store the tokens for loginout users (they wont be able to see the todos they made)
var cryptojs = require ('crypto-js');

module.exports = function (sequelize, DataTypes) {
	return sequelize.define ('token', {
		token: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [1]
			},
			set: function (value) {
				var hash = cryptojs.MD5(value).toString();

				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash)
			}
		},
		tokenHash: DataTypes.STRING
	});
}