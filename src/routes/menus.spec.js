const MongodbMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const request = require('supertest');
const expect = require('chai').expect;
const mongoose = require("mongoose");
const app = require('../app');
const mongod = new MongodbMemoryServer();
const Menu = mongoose.model('Menu');
const menuData = {
    RID: '1',
    menus: [{
        price: 1,
        date: new Date(2019,1,10),
        courses: [{
            course: 1,
            description: 'description'
        }]
    }]
};
const menu = new Menu(menuData);


beforeEach(() => {
    mongod.getConnectionString().then(uri => {
        mongoose.connect(uri, {useMongoClient: true});
    });
    menu.save().then(
        console.log('saved;')
    )
});

afterEach(() => {
    mongoose.disconnect();
    mongod.stop()
});
describe('GET /menus', function () {
    it('should not be able to get menus when not authenticated', function (done) {
        request(app)
            .get('/api/menus/')
            .set('Accept', 'application/json')
            .expect(401)
            .end(function (err) {
                console.log(err);
                if (err) return done(err);
                done()
            });
    });

    // TODO: search for restaurant id from token
    it('should be able to get menus when authenticated', function (done) {
        request(app)
            .get('/api/menus/')
            .set('Authorization', 'Bearer ' + 'abc')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, result) {
                expect(result.body).to.have.property('RID');
                expect(result.body.RID).to.equal(menu.RID);
                expect(result.body).to.have.property('menus');
                expect(result.body.menus[0].price).to.equal(menu.menus[0].price);
                expect(result.body.menus[0].date).to.equal(menu.menus[0].date.toISOString());
                expect(result.body.menus[0].courses[0].course).to.equal(menu.menus[0].courses[0].course);
                expect(result.body.menus[0].courses[0].description).to.equal(menu.menus[0].courses[0].description);
                done();
            });
    });

    it('should be able to save menus when authenticated', function (done) {
        let menuToSaveData = menuData.menus;
        menuToSaveData[0].price = 2;
        request(app)
            .put('/api/menus/')
            .send(menuToSaveData)
            .set('Authorization', 'Bearer ' + 'abc')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function(err, result) {
                expect(result.body.menus[1].price).to.equal(2);
                done();
            });
    })
});