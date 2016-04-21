var chai = require('chai');
var chaihttp = require('chai-http');
var expect = chai.expect;
chai.use(chaihttp);
var mongoose = require('mongoose');
process.env.MONGOLAB_URI = 'mongodb://localhost/todo_test';
var server = require('../server');
var User = require('../models/user');

describe('user routes testing', function() {
  var username;

  it('should create a user', function(done) {
    chai.request(server)
    .post('/api/users/signup')
    .send({ 'username': 'test', 'authentication.email': 'test@test.com', 'authentication.password': 'testtest' })
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
    .send({ 'username': 'test', 'authentication.email': 'test@test.com', 'authentication.password': 'testtest' })
    .end(function(err, res) {
      // superagent considers 4xx and 5xx statuses as errors
      expect(err).to.not.equal(null);
      expect(err).to.have.status(422);
      expect(err.response.body).to.have.property('msg', 'User already exists');
      done();
    });
  });

  it('should return user', function(done) {
    chai.request(server)
    .get('/api/users/' + username)
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('username', username);
      done();
    });
  });

  it('should update user with new info', function(done) {
    chai.request(server)
    .put('/api/users/' + username)
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
    .end(function(err, res) {
      expect(err).to.equal(null);
      expect(res).to.have.status(200);
      expect(res.body).to.have.property('msg', 'Success');
      done();
    });
  });

  it('should fail to delete a nonexisting user', function(done) {
    chai.request(server)
    .delete('/api/users/test1')
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
  var username;

  before(function(done) {
    User.create({ 'username': 'test', 'authentication.email': 'test@test.com', 'authentication.password': 'testtest' }, function(err, user) {
      this.testUser = user;
      done();
    });
  });

  it('should create a new item for a user already in db', function(done) {
      chai.request(server)
      .post('/api/items')
      .send({ 'username': 'test', 'name': 'testTask' })
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name', 'testTask');
        task = res.body.name;
        username = res.body.username;
        done();
      });
  });

  it('should fail to create a duplicate item for user', function(done) {
      chai.request(server)
      .post('/api/items')
      .send({ 'username': 'test', 'name': 'testTask' })
      .end(function(err, res) {
        expect(err).not.to.equal(null);
        expect(err).to.have.status(422);
        expect(err.response.body).to.have.property('msg', 'Duplicate task');
        done();
      });
  });

  it('should return a specific item for user', function(done) {
      chai.request(server)
      .get('/api/items/' + task)
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name', 'testTask');
        done();
      });
  });

  it('should fail to create an item for a nonexisting user', function(done) {
      chai.request(server)
      .post('/api/items')
      .send({ 'username': 'nonexistingUser', 'name': 'anotherTestTask' })
      .end(function(err, res) {
        expect(err).to.not.equal(null);
        expect(res).to.have.status(404);
        expect(res.body).to.have.property('msg', 'No such user');
        done();
      });
  });

  it('should fail to return a nonexisting item for user', function(done) {
      chai.request(server)
      .get('/api/items/' + 'nonexistingItem')
      .end(function(err, res) {
        expect(err).to.not.equal(null);
        expect(err).to.have.status(404);
        expect(err.response.body).to.have.property('msg', 'No such item');
        done();
      });
  });

  it('should return all items for user');

  it('should update a specific item with new info', function(done) {
      chai.request(server)
      .put('/api/items/' + task)
      .send({ 'username': username, 'name': 'updatedTask' })
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('name', 'updatedTask');
        task = res.body.name;
        done();
      });
  });

  it('should delete a specific item for user', function(done) {
      chai.request(server)
      .delete('/api/items/' + task)
      .end(function(err, res) {
        expect(err).to.equal(null);
        expect(res).to.have.status(200);
        expect(res.body).to.have.property('msg', 'Success');
        done();
      });
  });

  it('should fail to update a nonexisting item for user', function(done) {
    chai.request(server)
    .put('/api/items/' + task)
    .send({ 'username': username, 'name': 'updatedTask' })
    .end(function(err, res) {
      expect(err).to.not.equal(null);
      expect(err).to.have.status(404);
      expect(err.response.body).to.have.property('msg', 'No such item');
      done();
    });
  });

  it('should fail to delete a nonexisting item for user', function(done) {
    chai.request(server)
    .delete('/api/items/' + task)
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
      User.create({ 'username': 'test1', 'authentication.email': 'test1@test.com', 'authentication.password': 'testtest1' }, function(err, user1) {
        this.testUser1 = user1;
        User.create({ 'username': 'test2', 'authentication.email': 'test2@test.com', 'authentication.password': 'testtest2' }, function(err, user2) {
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
        expect(res.body).to.have.property('msg', 'Success');
        done();
      });
  });

  after(function(done) {
    mongoose.connection.db.dropDatabase(function() {
      done();
    });
  });
});
