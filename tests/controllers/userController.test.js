const request = require('supertest')
const { expect } = require('chai')

const app = require('../../app')
const db = require('../../models')

describe('# User controller', function() {
  it('/signup', done => {
    request(app)
      .post('/signup')
      .send('name=name&email=email&password=password&passwordCheck=password')
      .expect(302)
      .end(function(err, res) {
        db.User.findOne({
          where: {
            email: 'email'
          }
        }).then(user => {
          expect(user.email).to.be.equal('email')
          done()
        })
      })
  })
})
