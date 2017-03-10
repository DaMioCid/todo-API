const express    = require('express'),
      bodyParser = require('body-parser'),
      _          = require('underscore');

const app = express(),
      port = process.env.PORT || 6565;

const todos = [];
let todoId = 1;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Todo API Root');
});

//GET
app.get('/todos', (req, res) => {
    res.json(todos);
});

//GET single
app.get('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10),
        matchedTodo = _.findWhere(todos, {id: todoId})

    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

//POST - - CREATE 
app.post('/todos', (req, res) => {
    let body =  _.pick(req.body, 'desc', 'isDone');

    if(!_.isBoolean(body.isDone) || !_.isString(body.desc) || body.desc.trim().length === 0){
        return res.status(400).send();
    }

    body.desc = body.desc.trim();
    body.id = todoId++;
    
    todos.push(body);

    res.json(body);
    
});

app.listen(port, () => {
    console.log('SERVER ALIVEEEE!!!!!!!!! in port: ' + port);
});