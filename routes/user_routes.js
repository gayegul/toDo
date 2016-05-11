var express = require('express');
var User = require('../models/user');
var userRouter = express.Router();
var authRouter = require('./auth_routes');
var jwt = require('jsonwebtoken');
var superSecret = 'ilovemakeupnotsosecretbutyeah';

module.exports = userRouter;

userRouter.route('/users/signup')
  // creates a user
  .post(function(req, res) {
    User.findOne({ 'username': req.body.username }, function(err, data) {
      if(err) return res.send(err);
      if(data) return res.status(422).json({ msg: 'User already exists' });
      var user = new User();
      user.username = req.body.username;
      user.email = req.body.email;
      user.password = req.body.password;
      user.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  });

// middleware to verify a token
userRouter.use(function(req, res, next) {
  // check header or url params or post params for token
  var token = req.body.token || req.query.token || req.headers['token'];

  // decode token
  if(token) {
    // verifies secret and checks expiration
    jwt.verify(token, superSecret, function(err, decoded) {
      if(err) {
        return res.status(403).send({
          success: false,
          msg: 'Failed to authenticate token.'
        });
      } else {
        // if everything checks out, save to req to use in other routes
        req.decoded = decoded;
        next();
      }
    });
  } else {
    // if there is no token, return HTTP res of 403 (access forbidden)
    return res.status(403).send({
      success: false,
      msg: 'No token provided'
    });
  }
});

userRouter.route('/users/:username')
  // returns a specific user
  .get(function(req, res) {
    User.findOne({ 'username': req.params.username }, function(err, data) {
      if(err) return res.send(err);
      res.status(200).json(data);
    });
  })
  // updates user info
  .put(function(req, res) {
    User.findOne({ 'username': req.params.username }, function(err, user) {
      if(err) return res.send(err);
      else if(!user) return res.status(404).json({ msg: 'No such user' });
      else if(req.body.email) {
        if(user.username === req.body.username && user.email === req.body.email) {
          return res.status(422).json({ msg: 'No new info' });
        }
        else {
          user.username = req.body.username;
          user.email = req.body.email;
        }
      }
      else if(user.username === req.body.username) return res.status(422).json({ msg: 'No new info' });
      else if(user.username !== req.body.username) user.username = req.body.username;

      user.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  })
  // deletes a specific user
  .delete(function(req, res) {
    User.findOne({ 'username': req.params.username }, function(err, user) {
      if(err) return res.send(err);
      else if(!user) return res.status(404).json({ msg: 'You cannot delete someone that is not there' });
      User.remove({ 'username': req.params.username }, function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'Success' });
      });
    });
  });
