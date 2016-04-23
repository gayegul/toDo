var express = require('express');
var app = express();
var userRouter = require('./routes/user_routes');
var itemRouter = require('./routes/item_routes');
var authRouter = require('./routes/auth_routes');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

mongoose.connect(process.env.MONGOLAB_URI || 'mongodb://localhost/todo_dev');

module.exports = app;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function(req, res) {
  res.send('Main Page');
});

app.use('/api', authRouter);
app.use('/api', userRouter);
app.use('/api', itemRouter);

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log('server up and running');
});
