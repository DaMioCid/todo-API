const bcrypt = require('bcrypt'),
      _      = require('underscore');

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user', {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      salt: {
        type:DataTypes.STRING
      },
      password_hash: {
        type:DataTypes.STRING
      },
      password: {
        type: DataTypes.VIRTUAL,
        allowNull: false,
        validate: {
          len: [7, 100]
        },
        set: function(value) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);

            this.setDataValue('password', value);
            this.setDataValue('salt', salt);
            this.setDataValue('password_hash', hash);
        }
      }
  }, {
    hooks: {
      beforeValidate: (user, options) => {
        if(typeof user.email === 'string') {
          user.email = user.email.toLowerCase();
        }
      }
    },
    instanceMethods: {
      toPublicJSON: function () {
        const json = this.toJSON();
        return _.pick(json,'id', 'email', 'updatedAt', 'createdAt');
      }
    }
  });
};
