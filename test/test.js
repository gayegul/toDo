var chai = require('chai');
var chaihttp = require('chai-http');
var expect = chai.expect;
chai.use(chaihttp);
var mongoose = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_test';
var server = require('../server');
var User = require('../models/user');

describe('user routes testing', function() {
  var token;
  var username;

  it('should create a user', function(done) {
    chai.request(server)
    .post('/api/users/signup')
    .send({ 'username': 'test', 'email': 'test@test.com', 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('_id');
      expect(res.body.username).to.equal('test');
      username = res.body.username;
      done();
    });
  });

  it('should fail to create a duplicate user', function(done) {
    chai.request(server)
    .post('/api/users/signup')
    .send({ 'username': username, 'email': 'test@test.com', 'password': 'testtest' })
    .end(function(err, res) {
      // superagent considers 4xx and 5xx statuses as errors
      expect(err).to.not.equal(null);
      expect(err).to.have.status(422);
      expect(err.response.body).to.have.property('msg', 'User already exists');
      done();
    });
  });

  it('should fail to return user without token', function(done) {
    chai.request(server)
    .get('/api/users/' + username)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(res).to.have.status(403);
      expect(res.body.msg).to.equal('No token provided');
      done();
    });
  });

  it('should fail to sign in sucessfully with wrong username', function(done) {
    chai.request(server)
    .post('/api/users/signin')
    .send({ 'username': 'wrongUsername', 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Authentication failed. User not found.');
      done();
    });
  });

  it('should fail to sign in sucessfully with wrong password', function(done) {
    chai.request(server)
    .post('/api/users/signin')
    .send({ 'username': 'test', 'password': 'wrongPassword' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Authentication failed. Wrong info.');
      done();
    });
  });

  it('should sign in sucessfully', function(done) {
    chai.request(server)
    .post('/api/users/signin')
    .send({ 'username': username, 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Here is your token!');
      done();
    });
  });

  it('should give back a token after signing in sucessfully', function(done) {
    chai.request(server)
    .post('/api/users/signin')
    .send({ 'username': username, 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.token).to.be.a('string');
      token = res.body.token;
      done();
    });
  });

  it('should return user', function(done) {
    chai.request(server)
    .get('/api/users/' + username)
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.username).to.equal(username);
      done();
    });
  });

  it('should update user with new info', function(done) {
    chai.request(server)
    .put('/api/users/' + username)
    .set('token', token)
    .send({ 'username': 'test1' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.username).to.equal('test1');
      username = res.body.username;
      done();
    });
  });

  it('should fail to update user with existing info', function(done) {
    chai.request(server)
    .put('/api/users/' + username)
    .set('token', token)
    .send({ 'username': 'test1' })
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(422);
      expect(err.response.body).to.have.property('msg', 'No new info');
      done();
    });
  });

  it('should fail to update a nonexisting user', function(done) {
    chai.request(server)
    .put('/api/users/' + 'test2')
    .set('token', token)
    .send({ 'username': 'test1' })
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such user');
      done();
    });
  });

  it('should delete a user', function(done) {
    chai.request(server)
    .delete('/api/users/' + username)
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Success');
      done();
    });
  });

  it('should fail to delete a nonexisting user', function(done) {
    chai.request(server)
    .delete('/api/users/test1')
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'You cannot delete someone that is not there');
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});


describe('item routes testing', function() {
  var task;
  var token;
  var username = 'itemTestUser';

  before(function(done) {
    chai.request(server)
    .post('/api/users/signup')
    .send({ 'username': username, 'email': 'test@test.com', 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('_id');
      expect(res.body.username).to.equal(username);
      done();
    });
  });

  before(function(done) {
    chai.request(server)
    .post('/api/users/signin')
    .send({ 'username': username, 'password': 'testtest' })
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Here is your token!');
      token = res.body.token;
      done();
    });
  });

  it('should create a new item for a user already in db', function(done) {
    chai.request(server)
    .post('/api/users/' + username + '/items')
    .send({ 'username': username, 'itemname': 'testTask' })
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.itemname).to.equal('testTask');
      task = res.body.itemname;
      done();
    });
  });

  it('should fail to create a duplicate item for user', function(done) {
    chai.request(server)
    .post('/api/users/' + username + '/items')
    .send({ 'username': username, 'itemname': task })
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(422);
      expect(err.response.body).to.have.property('msg', 'Duplicate task');
      done();
    });
  });

  it('should return a specific item for user', function(done) {
    chai.request(server)
    .get('/api/users/' + username + '/items/' + task)
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.itemname).to.equal('testTask');
      done();
    });
  });

  it('should fail to create an item for a nonexisting user', function(done) {
    chai.request(server)
    .post('/api/users/' + 'nonexistingUser' + '/items')
    .send({ 'username': 'nonexistingUser', 'itemname': 'anotherTestTask' })
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such user');
      done();
    });
  });

  it('should fail to return a nonexisting item for user', function(done) {
    chai.request(server)
    .get('/api/users/' + username + '/items/' + 'nonexistingItem')
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such item');
      done();
    });
  });

  it('should return all items for user', function(done) {
    chai.request(server)
    .get('/api/users/' + username + '/items')
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.length(1);
      done();
    });
  });

  it('should update a specific item with new info', function(done) {
    chai.request(server)
    .put('/api/users/' + username + '/items/' + task)
    .send({ 'username': username, 'itemname': 'updatedTask' })
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.itemname).to.equal('updatedTask');
      task = res.body.itemname;
      done();
    });
  });

  it('should delete a specific item for user', function(done) {
    chai.request(server)
    .delete('/api/users/' + username + '/items/' + task)
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Success');
      done();
    });
  });

  it('should fail to update a nonexisting item for user', function(done) {
    chai.request(server)
    .put('/api/users/' + username + '/items/' + task)
    .send({ 'username': username, 'itemname': 'updatedTask' })
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such item');
      done();
    });
  });

  it('should fail to delete a nonexisting item for user', function(done) {
    chai.request(server)
    .delete('/api/users/' + username + '/items/' + task)
    .set('token', token)
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such item');
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });

});

describe('admin routes testing', function() {
  var userToDeleteLater;
  before(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      User.create({ 'username': 'test1', 'email': 'test1@test.com', 'password': 'testtest1' }, function(err, user1) {
        this.testUser1 = user1;
        User.create({ 'username': 'test2', 'email': 'test2@test.com', 'password': 'testtest2' }, function(err, user2) {
          this.testUser2 = user2;
          done();
        });
      });
    });
  });

  it('should return all users', function(done) {
    chai.request(server)
    .get('/api/admin/users')
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.length(2);
      done();
    });
  });

  it('should delete a user', function(done) {
    chai.request(server)
    .delete('/api/admin/users/' + User.testUser2.username)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body.msg).to.equal('Success');
      done();
    });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});
