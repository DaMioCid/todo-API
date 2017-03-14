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
        body =  _.pick(req.body, 'desc', 'isDone'),
        attributes = {};

        if(body.hasOwnProperty('isDone')){
            attributes.isDone = body.isDone;
        }

        if(body.hasOwnProperty('desc')){
            attributes.desc = body.desc;
        }

        db.todo.findById(todoId).then((todo) => {
          if (todo) {
            todo.update(attributes).then((todo) => {
              res.json(todo.toJSON());
            }, (err) => {
              res.status(400).json(err);
            });
          } else {
            res.status(404).send();
          }
        }, () => {
          res.status(500).send();
        });
});

//USER CREATE
app.post('/users', (req, res) => {
  let body = _.pick(req.body, 'email', 'password');

  db.user.create(body).then((user) => {
    res.json(user.toPublicJSON());
  }, (err) => {
    res.status(400).json(err);
  });
});

db.sequelize.sync({force:true}).then(() => {
  app.listen(port, () => {
      console.log('SERVER ALIVEEEE!!!!!!!!! in port: ' + port);
  });
});
