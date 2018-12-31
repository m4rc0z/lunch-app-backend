const request = require('supertest');
const app = require('../app');

describe('GET /users', function(){
    it('respond with json', function(done){
        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err){
                if (err) return done(err);
                done()
            });
    })
});