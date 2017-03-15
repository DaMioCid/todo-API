const cryptojs = require('crypto-js');

module.exports = function(db) {
  return {
    requireAuthentication: function(req, res, next) {
      const token =  req.get('Auth') || '';
      const where = {token_hash : cryptojs.MD5(token).toString()};

      db.token.findOne({where:where}).then((tokenInstance) => {
        if (!tokenInstance) {
          throw new Error();
        }
        req.token = tokenInstance;
        return db.user.findByToken(token);
      }).then((user) => {
        req.user = user;
        next();
      }).catch(() => {
        res.status(401).send();
      });
    }
  };
};
