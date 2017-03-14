const bcrypt = require('bcrypt'),
      _      = require('underscore');

module.exports = function(sequelize, DataTypes) {
  const user = sequelize.define('user', {
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
    classMethods: {
      authenticate: (body) => {
        return new Promise((resolve, reject) => {
          let  where = {};

          if (typeof body.email !== 'string' || typeof body.password !== 'string') {
            return reject();
          } else {
            where.email = body.email;
          }
          user.findOne({where: where}).then((user) => {
            if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))) {
              return reject();
            }
          resolve(user);
          }, (err) => {
            reject();
          });
        });
      }
    },
    instanceMethods: {
      toPublicJSON: function () {
        const json = this.toJSON();
        return _.pick(json,'id', 'email', 'updatedAt', 'createdAt');
      }
    }
  });
  return user;
};
