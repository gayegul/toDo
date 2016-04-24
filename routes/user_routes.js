var express = require('express');
var User = require('../models/user');
var userRouter = express.Router();

module.exports = userRouter;

userRouter.route('/admin/users')
  // returns all users for admin
  .get(function(req, res) {
    User.find({}, function(err, data) {
      if(err) return res.send(err);
      res.status(200).json(data);
    });
  });

userRouter.route('/admin/users/:username')
  // deletes a specific user for admin
  .delete(function(req, res) {
    User.findOne({ 'username': req.params.username }, function(err, user) {
      if(err) return res.send(err);
      if(!user) return res.status(404).json({ msg: 'User does not exist' });
      User.remove({ 'username': req.params.username }, function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'Success' });
      });
    });
  });

userRouter.route('/users/signup')
  // creates a user
  .post(function(req, res) {
    User.findOne({ 'username': req.body.username }, function(err, data) {
      if(err) return res.send(err);
      if(data) return res.status(422).json({ msg: 'User already exists' });
      var user = new User();
      user.username = req.body.username;
      user.authentication.email = req.body.email;
      user.authentication.password = req.body.password;
      user.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
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
      if(!user) return res.status(404).json({ msg: 'No such user' });
      if(user.username === req.body.username && user.authentication.email === req.body.email) return res.status(422).json({ msg: 'No new info' });
      if(user.username !== req.body.username) user.username = req.body.username;
      if(user.authentication.email !== req.body.email) user.authentication.email = req.body.email;
      // if(user.authentication.password !== req.body.password) user.authentication.password = req.body.password;
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
      if(!user) return res.status(404).json({ msg: 'You cannot delete someone that is not there' });
      User.remove({ 'username': req.params.username }, function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'Success' });
      });
    });
  });
