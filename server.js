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
  let query = req.query;
  let where = {};

    if (query.hasOwnProperty('isDone') && query.isDone === 'true') {
      where.isDone = true;
    } else if (query.hasOwnProperty('isDone') && query.isDone === 'false'){
      where.isDone = false;
    }

    if (query.hasOwnProperty('q') && query.q.length > 0) {
      where.desc = {
        $like: '%' + query.q + '%'
      };
    }

    db.todo.findAll({where:where}).then((todos) => {
      res.json(todos);
    }, (err) => {
      res.status(500).send();
    });
});

//GET single
app.get('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then((todo) => {
      if(!!todo) {
        res.json(todo.toJSON());
      }else {
        res.status(404).json();
      }
    }, (err) => {
      res.status(500).send();
    });
});

//POST - - CREATE
app.post('/todos', (req, res) => {
    let body =  _.pick(req.body, 'desc', 'isDone');

    db.todo.create(body).then((todo) => {
      res.json(todo.toJSON());
    }, (err) => {
      res.status(400).json(err);
    });
});


//DELETE
app.delete('/todos/:id', (req, res) => {
    let todoId = parseInt(req.params.id, 10);

    db.todo.destroy({where:{id:todoId}}).then((rowsDeleted) => {
      if (rowsDeleted === 0) {
        res.status(404).json({error: 'No todo with id'});
      } else {
        res.status(204).send();
      }
    }, (err) => {
      res.status(500).send();
    });
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
