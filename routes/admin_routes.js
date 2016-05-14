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
