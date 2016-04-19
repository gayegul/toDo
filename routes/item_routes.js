var express = require('express');
var Item = require('../models/item');
var User = require('../models/user');
var itemRoutes = express.Router();

module.exports = itemRoutes;

itemRoutes.route('/items')
  // returns all items for a given user
  .get(function(req, res) {
    Item.find({}, function(err, data) {
      if(err) return res.send(err);
      res.status(200).json(data);
    });
  })
  // creates new task for a given user
  .post(function(req, res) {
    var item = new Item(req.body);

    Item.findOne({ 'username': req.body.username, 'name': req.body.name }, function(err, item) {
      if(err) return res.send(err);
      if(item) return res.status(422).json({ msg: 'duplicate task' });
    });

    User.findOne({ 'username': req.body.username }, function(err, user) {
      if(err) return res.send(err);
      if(!user) return res.status(404).json({ msg: 'no such user' });
      item.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  });

itemRoutes.route('/items/:name')
  // returns specific item
  .get(function(req, res) {
    Item.findOne({ 'name': req.params.name }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'no such item' });
      res.status(200).json(item);
    });
  })
  // updates item
  .put(function(req, res) {
    Item.findOne({ 'name': req.params.name, 'username': req.body.username }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'no such item' });
      if(item.name === req.body.name) return res.json({ msg: 'same as previous info' });
      if(item.name !== req.body.name) item.name = req.body.name;
      item.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  })
  // deletes item
  .delete(function(req, res) {
    Item.findOne({ 'name': req.params.name }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'no such item' });
      item.remove(function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'success' });
      });
    });
  });
