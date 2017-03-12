const express    = require('express'),
      bodyParser = require('body-parser'),
      _          = require('underscore'),
      db         = require('./db.js');

const app = express(),
      port = process.env.PORT || 6565;

let todos = [],
     todoId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root');
});

//GET
app.get('/todos', (req, res) => {
    let queryParams = req.query,
        filteredTodos = todos;

    if(queryParams.hasOwnProperty('isDone') && queryParams.isDone === 'true'){
        filteredTodos = _.where(filteredTodos, { isDone: true} );
    } else if(queryParams.hasOwnProperty('isDone') && queryParams.isDone === 'false'){
        filteredTodos = _.where(filteredTodos, { isDone: false} );
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, (todo) => {
            return   todo.desc.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }

    res.json(filteredTodos);
});

//GET single
app.get('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});

    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//POST - - CREATE
app.post('/todos', (req, res) => {
    let body =  _.pick(req.body, 'desc', 'isDone');

    db.todo.create(body).then((todo) => {
      res.json(todo.toJSON());
    }, (err) => {
      res.status(400).json(err);
    });

    // if(!_.isBoolean(body.isDone) || !_.isString(body.desc) || body.desc.trim().length === 0){
    //     return res.status(400).send();
    // }
    //
    // body.desc = body.desc.trim();
    // body.id = todoId++;
    //
    // todos.push(body);
    //
    // res.json(body);

});


//DELETE
app.delete('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId});

        if(!matchedTodo){
            res.status(404).json({"error": "no todo found with that id"});
        } else {
            todos = _.without(todos, matchedTodo);
            res.json(matchedTodo);
        }
});

//UPDATE
app.put('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId}),
        body =  _.pick(req.body, 'desc', 'isDone'),
        validAttributes = {};

        if(!matchedTodo){
        return res.status(404).send();
        }

        //isDone validation
        if(body.hasOwnProperty('isDone') && _.isBoolean(body.isDone)){
            validAttributes.isDone = body.isDone;
        } else if ( body.hasOwnProperty('isDone')){
            return res.status(400).send();
        }

        //desc validation
        if(body.hasOwnProperty('desc') && _.isBoolean(body.desc) && body.desc.trim().length > 0){
            validAttributes.desc = body.desc;
        } else if ( body.hasOwnProperty('desc')){
            return res.status(400).send();
        }

        //Objects in js are passed by reference!
        _.extend(matchedTodo, validAttributes);
        res.json(matchedTodo);
});

db.sequelize.sync().then(() => {
  app.listen(port, () => {
      console.log('SERVER ALIVEEEE!!!!!!!!! in port: ' + port);
  });
});
