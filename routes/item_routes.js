var express = require('express');
var Item = require('../models/item');
var User = require('../models/user');
var itemRoutes = express.Router();

module.exports = itemRoutes;

itemRoutes.route('/users/:username/items')
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

    Item.findOne({ 'username': req.params.username, 'itemname': req.params.itemname }, function(err, item) {
      if(err) return res.send(err);
      if(item) return res.status(422).json({ msg: 'Duplicate task' });
    });

    User.findOne({ 'username': req.params.username }, function(err, user) {
      if(err) return res.send(err);
      if(!user) return res.status(404).json({ msg: 'No such user' });
      item.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  });

itemRoutes.route('/users/:username/items/:itemname')
  // returns specific item
  .get(function(req, res) {
    Item.findOne({ 'itemname': req.params.itemname }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'No such item' });
      res.status(200).json(item);
    });
  })
  // updates item
  .put(function(req, res) {
    Item.findOne({ 'itemname': req.params.itemname, 'username': req.params.username }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'No such item' });
      if(item.itemname === req.body.itemname) return res.json({ msg: 'Same as previous info' });
      if(item.itemname !== req.body.itemname) item.itemname = req.body.itemname;
      item.save(function(err, data) {
        if(err) return res.send(err);
        res.status(200).json(data);
      });
    });
  })
  // deletes item
  .delete(function(req, res) {
    Item.findOne({ 'itemname': req.params.itemname, 'username': req.params.username }, function(err, item) {
      if(err) return res.send(err);
      if(!item) return res.status(404).json({ msg: 'No such item' });
      item.remove(function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'Success' });
      });
    });
  });
