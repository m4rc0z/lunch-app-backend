const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
const Controller = require('./restaurant.controller');
const Restaurant = require('../models/restaurant.model');
const restaurantUtil = require("../restaurant.util");

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

    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('getAll', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        const addSpyAndAssert = (error, response) => {
            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec(error, response)})),
            };
            Restaurant.find = sinon.stub().callsFake(() => populate);

            Controller.getAll(req, res);

            sinon.assert.calledWith(
                Restaurant.find,
                {},
            );

            sinon.assert.calledWith(
                populate.populate,
                {
                    path: 'menus',
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                });
        };

        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            addSpyAndAssert(undefined, mongoResponse);
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
        }));
    });

    describe('getOne', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        const addSpyAndAssert = (error, response) => {
            const populate = {
                populate: sinon.stub().callsFake(() => {
                    return {populate: populate2}
                }),
            };
            const populate2 = sinon.stub().callsFake(() => ({exec: exec => exec(error, response)}));
            Restaurant.findOneAndUpdate = sinon.stub().callsFake(() => populate);

            Controller.getOne(req, res);

            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {}, {
                    upsert: true,
                    new: true
                },
            );

            sinon.assert.calledWith(
                populate.populate,
                'menus'
            );
            sinon.assert.calledWith(
                populate2,
                'categories'
            );
        };
        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            addSpyAndAssert(undefined, mongoResponse);
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
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

        const addSpyAndAssert = (error, response) => {
            const populate = {
                populate: sinon.stub().callsFake(() => {
                    return {exec: exec => exec(error, response)}
                }),
            };
            Restaurant.findOneAndUpdate = sinon.stub().callsFake(() => populate);

            Controller.getMenus(req, res);

            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id}, {}, {
                    upsert: true,
                    new: true
                },
            );

            sinon.assert.calledWith(
                populate.populate,
                {
                    path: 'menus',
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                }
            );
        };
        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            addSpyAndAssert(undefined, mongoResponse);
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
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

        const addSpyAndAssert = (error, response) => {
            Restaurant.findOneAndUpdate = sinon.stub().callsFake(() => ({exec: exec => exec(error, response)}));

            Controller.update(req, res);

            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id},
                req.body,
                {upsert: true, new: true},
            );
        };
        it('should return expected restaurants', test(function () {
            const mongoResponse = ['test', 'test2'];
            addSpyAndAssert(undefined, mongoResponse);
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurants error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurants undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
        }));
    });

    describe('updateImage', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        const addSpyAndAssert = (error, response) => {
            req.file = {
                url: 'testurl',
                public_id: 'publicId',
            };
            Restaurant.findOneAndUpdate = sinon.stub().callsFake(() => ({exec: exec => exec(error, response)}));

            Controller.updateImage(req, res);

            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id},
                { imageUrl: req.file.url },
                {upsert: true, new: true},
            );
        };
        it('should return expected restaurant', test(function () {
            const mongoResponse = 'test';
            addSpyAndAssert(undefined, mongoResponse);
            sinon.assert.calledWith(res.send, mongoResponse);
        }));

        it('should return 500 when restaurant error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurant undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
        }));
    });

    describe('updateMenus', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        const addSpyAndAssert = (error, response) => {
            req.file = {
                url: 'testurl',
                public_id: 'publicId',
            };
            Restaurant.findOneAndUpdate = sinon.stub().callsFake(() => ({exec: exec => exec(error, response)}));

            Controller.updateMenus(req, res);

            sinon.assert.calledWith(
                Restaurant.findOneAndUpdate,
                {RID: req.params.id},
                {upsert: true, new: true},
            );
        };

        it('should call restaurantUtil when necessary', test(function () {
            sandbox.stub(restaurantUtil, 'createOrUpdateMenus');
            req.body.menus = 'test1';
            addSpyAndAssert(undefined, 'test');
            sinon.assert.calledWith(restaurantUtil.createOrUpdateMenus, 'test1', 'test');
        }));

        it('should return 500 when restaurant error', test(function () {
            addSpyAndAssert('error', undefined);
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

        it('should return 404 when restaurant undefined', test(function () {
            addSpyAndAssert(undefined, undefined);
            sinon.assert.calledWith(res.send, 404);
        }));
    });


});