const express = require('express');

const app = express(),
      port = process.env.PORT || 6565;

const todos = [{
    id: 1,
    desc: 'Go to the gym',
    isDone: false
}, {
    id: 2,
    desc: 'grocery shopping',
    isDone: false
}, {
    id: 3,
    desc: 'make dinner',
    isDone: true
}];


app.get('/', (req, res) => {
    res.send('Todo API Root');
});

//GET
app.get('/todos', (req, res) => {
    res.json(todos);
});

//GET single
app.get("/todos/:id", (req, res) => {
    let todoId = parseInt(req.params.id, 10),
        matchedTodo;

    todos.forEach((todo) => {
        if(todoId === todo.id){
            matchedTodo = todo;
        }
    });

    if(matchedTodo){
        res.json(matchedTodo);
    } else {
        res.status(404).send;
    }
});

app.listen(port, () => {
    console.log('SERVER ALIVEEEE!!!!!!!!! in port: ' + port);
});