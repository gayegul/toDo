var express = require('express');
var User = require('../models/user');
var jsonParser = require('body-parser').json();
var jwt = require('jsonwebtoken');
var superSecret = 'ilovemakeupnotsosecretbutyeah';

var authRouter = module.exports = express.Router();

authRouter.post('/users/signin', function(req, res) {
  User.findOne({ 'username': req.body.username })
  .select('username password')
  .exec(function(err, user) {
    if(err) return res.send(err);
    if(!user) return res.json({
      // user is not found
      success: false,
      msg: 'Authentication failed. User not found.'
    });
    else if(user) {
      // check if password matches
      var validPassword = user.comparePassword(req.body.password);
      if(!validPassword) {
        res.json({
          success: false,
          msg: 'Authentication failed. Wrong info.'
        });
      }
      else {
        // user found and password is right
        var token = jwt.sign({
          username: user.username,
          email: user.email
          }, superSecret, {
          expiresIn: 86400 // seconds
          }); // expires in 24 hours

        // return the info including token as JSON
        res.json({
          success: true,
          msg: 'Here is your token!',
          token: token
        });
      }
    }
  });
});

// TODO
// Improve email validation
