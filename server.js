// server.js

// express is for routing and easing composing HTTP response (adding headers, etc)

// set up (initialize) ===============================
var express = require('express'),
	 app = express(),
	 morgan = require('morgan'),
	 bodyParser = require('body-parser'),
	 mongoose = require('mongoose');

// configs ===========================================
mongoose.connect('mongodb://localhost/Test');
// mongoose.connect('mongodb://dummydb.modulusmongo.net');
// free mongodb databse on modulus.io
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error...'));
db.once('open', function callback() {
	console.log('Test db is now open.')
})

app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users
app.use(morgan({
    format: 'dev',
    immediate: true
}));
app.use(bodyParser()); // pull information from html in POST


// define model ======================================
var Todo = mongoose.model('Todo', {
	text: String
});

// routes ============================================

	// api -------------------------------------------

	// get all todo objects
	app.get('/api/todos', function(req, res) {
			// use mongoose to get all todos in the datbase
			Todo.find(function(err, todos) {
				// if there is an error retrieving, send the error. nothing after res.send(err) will execute
				if (err)
					res.send(err)

				res.json(todos);
			})
		});
		
	// create todo and send back all todos after creation
	// route for post requests (the request handler for post requests)
	app.post('/api/todos', function(req, res) {
		// create a todo, information comes from AJAX request from Angular
		Todo.create({
			text: req.body.text,
			done: false
		}, function(err, todo){
			if (err)
				res.send(err);
			// if there's no error, it means that the insertion of the the entry has been done successfully
			// in this case, we want to show all todo objects, so we have nothing to do with 'todo' object(entry) just added, 
			// but rather with 'todos' object (all todos): we want to show them all
			// we retries them using mongoose model
			// mongoose use a callback to store the result in the second argument of the function, here 'todos' or whatever we name it (when the operation is completed)
			Todo.find(function(err, todos) {
				if (err)
					res.send(err);
				res.json(todos);
			});
		});

	});

	// delete a todo 
	// add a route (using express 'app') and handler for DELETE-type HTTP requests
	app.delete('/api/todos/:todo_id', function(req, res) {
		// using mongoose model to remove an entry/object
		Todo.remove({_id: req.params.todo_id}, function(err, todo) {
			if (err)
				res.send(err);
			// fetching all todos (the entries / objects) and send them back in a json object
			Todo.find(function(err, todos) {
				if (err)
					res.send(err);
				res.json(todos);
			});
		});

	})

	// application -------------------------------------------------------------
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
	});

// listen for requests ===============================
app.listen(8080);
console.log('App is listening on port 8080 ...');
