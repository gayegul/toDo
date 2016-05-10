var express = require('express');
var Item = require('../models/item');
var User = require('../models/user');
var jwt = require('jsonwebtoken');
var superSecret = 'ilovemakeupnotsosecretbutyeah';
var itemRouter = express.Router();

module.exports = itemRouter;

// middleware to verify a token
itemRouter.use(function(req, res, next) {
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

itemRouter.route('/users/:username/items')
  // returns all items for a given user
  .get(function(req, res) {
    Item.find({}, function(err, data) {
      if(err) return res.send(err);
      res.status(200).json(data);
    });
  })
  // creates new task for a given user
  .post(function(req, res) {
    User.findOne({ 'username': req.params.username }, function(err, user) {
      if(err) return res.send(err);
      else if(!user) return res.status(404).json({ msg: 'No such user' });
      else {
        Item.findOne({ 'username': req.body.username, 'itemname': req.body.itemname }, function(err, existingItem) {
          if(err) return res.send(err);
          else if(existingItem) return res.status(422).json({ msg: 'Duplicate task' });
          else {
            var item = new Item(req.body);

            item.save(function(err, data) {
              if(err) return res.send(err);
              res.status(200).json(data);
            });
          }
        });
      }
    });
  });

itemRouter.route('/users/:username/items/:itemname')
  // returns specific item
  .get(function(req, res) {
    Item.findOne({ 'itemname': req.params.itemname }, function(err, item) {
      if(err) return res.send(err);
      else if(!item) return res.status(404).json({ msg: 'No such item' });
      res.status(200).json(item);
    });
  })
  // updates item
  .put(function(req, res) {
    Item.findOne({ 'itemname': req.params.itemname, 'username': req.params.username }, function(err, item) {
      if(err) return res.send(err);
      else if(!item) return res.status(404).json({ msg: 'No such item' });
      else if(item.itemname === req.body.itemname) return res.json({ msg: 'Same as previous info' });
      else if(item.itemname !== req.body.itemname) item.itemname = req.body.itemname;
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
      else if(!item) return res.status(404).json({ msg: 'No such item' });
      item.remove(function(err) {
        if(err) return res.send(err);
        res.status(200).json({ msg: 'Success' });
      });
    });
  });
