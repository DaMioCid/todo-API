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
  });
};
