module.exports = function(sequelize, DataTypes) {
  return sequelize.define('todo', {
      desc: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
              len: [1, 100]
          }
      },
      isDone: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
      }
  }, {
    hooks: {
      beforeValidate: (todo, options) => {
        if(typeof todo.isDone !== 'boolean' || typeof todo.desc === 'boolean'){
          throw new Error('Invalid input');
        }
      }
    }
  });
};
