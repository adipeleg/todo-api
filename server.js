var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');

var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];


app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.send('Todo API Root');
});

//GET /todos?completed=true&q=work
app.get('/todos', function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === 'true') {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === 'false') {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		};
	}

	db.todo.findAll({
		where: where
	}).then(function(todos) {
		res.json(todos);
	}, function(e) {
		res.status(500).send();
	});



	// 	var queryParams = req.query;
	// 	var filteredTodos = todos;

	// 	if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
	// 		filteredTodos = _.where(filteredTodos, {
	// 			completed: true
	// 		});
	// 	} else if (queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
	// 		filteredTodos = _.where(filteredTodos, {
	// 			completed: false
	// 		});
	// 	}

	// 	if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
	// 		filteredTodos = _.filter(filteredTodos, function(todo) {
	// 			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
	// 		});
	// 	}


	// 	res.json(filteredTodos);
});

//GET /todos/:id
app.get('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findById(todoId).then(function(todo) {
		if (!!todo) {
			res.json(todo.toJSON());
		} else {
			res.status(404).send("not found");
		}
	}, function(e) {
		res.status(500).send(e);
	});
	// var todoItem = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (todoItem) {
	// 	res.json(todoItem);
	// } else {
	// 	res.status(404).send('Not found');
	// }
});

//POST /todos
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');
	//call create on db.todo

	db.todo.create(body).then(function(todo) {
		res.json(todo.toJSON());
	}, function(e) {
		//console.log("problem with post");
		res.status(400).json(e);
	});



	//respond with the rodo
	//res.status(400).json(e)

	// //validation of the data provided
	// if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
	// 	return res.status(400).send(); //bad data was provided
	// }

	// body.description = body.description.trim();


	// body.id = todoNextId++;
	// todos.push(body);
	// res.json(body);
});


//DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	db.todo.destroy({
		where: {
			id: todoId
		}
	}).then(function(rowsDeleted) {
		if(rowsDeleted === 0) {
			res.status(404).json({
				error: 'No todo woth id'
			});
		} else {
			res.status(204).send();
		}
	}, function (e) {
		res.status(500).send();
	});


	// var todoItem = _.findWhere(todos, {
	// 	id: todoId
	// });

	// if (!todoItem) {
	// 	res.status(404).json({
	// 		"error": "no todo found with that id"
	// 	});
	// } else {
	// 	todos = _.without(todos, todoItem);
	// 	res.json(todoItem);
	// }

});

//PUT /todos/:id
app.put('/todos/:id', function(req, res) {
	var todoId = parseInt(req.params.id, 10);
	var todoItem = _.findWhere(todos, {
		id: todoId
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!todoItem) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		//bad
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(todoItem, validAttributes);
	res.json(todoItem);

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port ' + PORT + "!");
	});
});