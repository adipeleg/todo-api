module.exports = function(sequelize, DataTypes) {
	return sequelize.define('todo', {
		description: {
			type: DataTypes.STRING,
			allowNull: false, //description is not optional -validation
			validate: {
				len: [1, 250] //can't be an empty string // http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations
			}
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false, //completed is not optional -validation
			defaultValue: false
		}
	});
};