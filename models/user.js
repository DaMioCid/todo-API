const bcrypt   = require('bcrypt'),
      cryptojs = require('crypto-js'),
      jwt      = require('jsonwebtoken'),
      _        = require('underscore');

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
      },
      generateToken: function(type) {
        if(!_.isString(type)){
          return undefined;
        }
        try {
          let stringData = JSON.stringify({id: this.get('id'), type: type});
          let encryptedData = cryptojs.AES.encrypt(stringData, 'abc123!@#').toString();
          let token = jwt.sign({token: encryptedData},'qwer7890');

          return token;
        } catch(err) {
          return undefined;
        }
      }
    }
  });
  return user;
};
