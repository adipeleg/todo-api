var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
}); //create an instance of sequelize

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false, //description is not optional -validation
		validate: {
			len: [1, 250] //can't be an empty string // http://docs.sequelizejs.com/en/latest/docs/models-definition/#validations
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false, //completed is not optional -validation
		defaultValue: false
	}
})

var User = sequelize.define('user', {
	email: Sequelize.STRING
});

Todo.belongsTo(User);
User.hasMany(Todo);


sequelize.sync({
	//force: true //delete the database
}).then(function() {
	console.log('Everything is synced');

	User.findById(1).then(function(user) {
		user.getTodos({
			where: {
				completed: false
			}
		}).then(function(todos) {
			todos.forEach(function(todo) {
				console.log(todo.toJSON());
			});
		});
	});
});



// 	User.create({
// 		email: 'Adi@exmp.com'
// 	}).then(function() {
// 		return Todo.create({
// 			description: 'clean yard'
// 		});
// 	}). then (function (todo) {
// 		User.findById(1).then(function(user){
// 			user.addTodo(todo);
// 		});
// 	});

// });

// Todo.findById(2).then (function (todo){
// 	if (todo) {
// 		console.log (todo.toJSON());
// 	} else {
// 		console.log('todo not found');
// 	}
// });

// Todo.create({
// 	description: 'Take out trash',
// 	//completed: false
// }).then(function (todo) {
// 	return Todo.create({
// 		description: 'Clean office'
// 	});
// }).then(function(){
// 	//return Todo.findById(1)   //find object using id
// 	return Todo.findAll({       //search by a qritiria
// 		where: {
// 			//completed: false    //search all false
// 			description: {
// 				$like: '%Office%'  //search for descriptiom with the word "trash" in it
// 			}
// 		}
// 	});
// }).then(function (todos) {
// 	if(todos) {
// 		todos.forEach(function(todo){
// 			console.log(todo.toJSON());
// 		});	
// 	} else {
// 		console.log ('no todo found');
// 	}
// }).catch(function (e) {
// 	console.log(e);
// });
// });