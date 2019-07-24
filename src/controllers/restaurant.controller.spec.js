const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
const Controller = require('./restaurant.controller');
const Menu = require('../models/menu.model');
const Restaurant = require('../models/restaurant.model');

describe('Restaurant Controller', function () {
    let req = {
            body: {
                menus: undefined,
            },
            user: {
                sub: '1'
            },
            params: {
                id: 1,
            }
        },
        res = {}, expectedResult;

    describe('getAll', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            this.stub(Restaurant, 'find').returns({
                exec: exec => exec(undefined, mongoResponse)
            });
            Controller.getAll(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            this.stub(Restaurant, 'find').returns({
                exec: exec => exec('error', undefined)
            });
            Controller.getAll(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            this.stub(Restaurant, 'find').returns({
                exec: exec => exec(undefined, undefined)
            });
            Controller.getAll(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );
            sinon.assert.calledWith(res.status, 404);
        }));
    });

    describe('get', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec(undefined, mongoResponse)
                })
            });
            Controller.get(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {},
                {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec('error', undefined)
                })
            });
            Controller.get(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {},
                {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec(undefined, undefined)
                })
            });
            Controller.get(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {},
                {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.status, 404);
        }));
    });

    describe('getMenus', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected menus', test(function () {
            const mongoResponse = {testrestaurant: 'test'};
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec(undefined, mongoResponse)
                })
            });
            Controller.getMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return correct status for not found menus', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec(undefined, undefined)
                })
            });
            Controller.getMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.status, 404);

        }));

        it('should return correct status for error', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                populate: () => ({
                    exec: exec => exec('test error', undefined)
                })
            });
            Controller.getMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'test error');
        }));

    });

    describe('update', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected restaurant', test(function () {
            const mongoResponse = {testrestaurant: 'test'};
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, mongoResponse)

            });
            Controller.update(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return correct status for not found restaurant', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, undefined)
            });
            Controller.update(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.status, 404);

        }));

        it('should return correct status for error', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec('test error', undefined)
            });
            Controller.update(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'test error');
        }));

    });

    describe('updateMenus', function () {
        beforeEach(function () {
            res = {
                send: sinon.stub().returns({end: sinon.spy()}),
                status: sinon.stub().returns({end: sinon.spy()})
            };
        });

        it('should return expected restaurant', test(function () {
            var expectedRestaurant = 'test';
            const restaurant = {
                populate: () => ({
                    populate: func => func(undefined, expectedRestaurant)
                }),
                menus: ['testMenu'],
            };
            const mongoResponse = {
                save: (func) => func(undefined, restaurant),
                ...restaurant
            };
            req.body.menus = [{test: '123'}];
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, mongoResponse)

            });
            this.stub(Menu.prototype, 'save').yields(undefined);

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, expectedRestaurant);
        }));

        it('should return 500 when error at findOneAndUpdate', test(function () {
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec('error', undefined)
            });

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 500 when error at save of menus', test(function () {
            var expectedRestaurant = 'test';
            const restaurant = {
                populate: () => ({
                    populate: func => func(undefined, expectedRestaurant)
                }),
                menus: ['testMenu'],
            };
            const mongoResponse = {
                save: (func) => func(undefined, restaurant),
                ...restaurant
            };
            req.body.menus = [{test: '123'}];

            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, mongoResponse)
            });
            this.stub(Menu.prototype, 'save').yields('error');

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 no restaurant found', test(function () {
            req.body.menus = [{test: '123'}];

            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, undefined)
            });

            this.stub(Menu.prototype, 'save').yields(undefined);

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 404, 'restaurant not found');
        }));

        it('should return 500 on save restaurant error', test(function () {
            var expectedRestaurant = 'test';
            const restaurant = {
                populate: () => ({
                    populate: func => func(undefined, expectedRestaurant)
                }),
                menus: ['testMenu'],
            };
            const mongoResponse = {
                save: (func) => func('error', undefined),
                ...restaurant
            };
            req.body.menus = [{test: '123'}];
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, mongoResponse)

            });
            this.stub(Menu.prototype, 'save').yields(undefined);

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 500 on populate restaurant error', test(function () {
            var expectedRestaurant = 'test';
            const restaurant = {
                populate: () => ({
                    populate: func => func('populateError', expectedRestaurant)
                }),
                menus: ['testMenu'],
            };
            const mongoResponse = {
                save: (func) => func(undefined, restaurant),
                ...restaurant
            };
            req.body.menus = [{test: '123'}];
            this.stub(Restaurant, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, mongoResponse)

            });
            this.stub(Menu.prototype, 'save').yields(undefined);

            Controller.updateMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {upsert: true, new: true}
            );
            sinon.assert.calledWith(res.send, 500, 'populateError');
        }));

    });

    describe('deleteMenus', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected return value for successfull delete', test(function () {
            const mongoResponse = 'test123';
            req.body.menus = [{_id: 1}];
            this.stub(Restaurant, 'update').returns({
                exec: exec => exec(undefined, mongoResponse)
            });
            Controller.deleteMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.update,
                {RID: req.params.id},
            );
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when error at delete', test(function () {
            req.body.menus = [{_id: 1}];
            this.stub(Restaurant, 'update').returns({
                exec: exec => exec('error', undefined)
            });
            Controller.deleteMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.update,
                {RID: req.params.id},
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when delete returns undefined', test(function () {
            req.body.menus = [{_id: 1}];
            this.stub(Restaurant, 'update').returns({
                exec: exec => exec(undefined, undefined)
            });
            Controller.deleteMenus(req, res);
            sinon.assert.calledWith(
                Restaurant.update,
                {RID: req.params.id},
            );
            sinon.assert.calledWith(res.status, 404);
        }));
    });

});