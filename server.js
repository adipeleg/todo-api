var express = require('express');
var bodyParser = require('body-parser');
var _ = require ('underscore');

var app = express();
var PORT = process.env.PORT || 3000;
var todoNextId = 1;
var todos = [];

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

//GET /todos
app.get('/todos', function (req, res){
	res.json(todos);
});

//GET /todos/:id
app.get ('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id, 10);
	var todoItem = _.findWhere(todos, {id: todoId});

	if(todoItem){
		res.json(todoItem);
	}else{
		res.status(404).send('Not found');
	}
});

//POST /todos
app.post('/todos', function (req, res){
	var body =  _.pick(req.body, 'description', 'completed');

	//validation of the data provided
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send(); //bad data was provided
	}

	body.description = body.description.trim();


	body.id = todoNextId++;
	todos.push(body);
	res.json(todos);
})


//DELETE /todos/:id
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var todoItem = _.findWhere(todos, {id: todoId});

	if(!todoItem){
		res.status(404).json({"error": "no todo found with that id"});
	} else {
		todos = _.without(todos, todoItem);
		res.json(todoItem);
	}

});

app.listen(PORT, function (){
	console.log('Express listening on port ' + PORT + "!");
});

