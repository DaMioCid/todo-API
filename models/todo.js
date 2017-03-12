module.exports = function(sequelize, Datatypes) {
  return sequelize.define('todo', {
      desc: {
          type: Datatypes.STRING,
          allowNull: false, //not optional
          validate: {
              // notEmpty: true //prevents empty string from adding todos'
              len: [1, 250] //allows to set length of string (1 < x < 250)
          }
      },
      isDone: {
          type: Datatypes.BOOLEAN,
          allowNull: false,
          defaultValue: false
      }
  });
};
