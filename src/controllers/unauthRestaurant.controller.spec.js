const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
const Controller = require('./unauthRestaurant.controller');
const Restaurant = require('../models/restaurant.model');

describe('Unauth Restaurant Controller', function () {
    let req = {
            body: {
                menus: undefined,
            },
            user: {
                sub: '1'
            },
            params: {
                id: 1,
            },
            query: {}
        },
        res = {}, expectedResult;

    let start, end;
    describe('getByDate', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body;
            req.query.categories = 'vegan,vegetarisch';
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';
            start = new Date(req.query.fromDate.substr(0, 10));
            end = new Date(req.query.toDate.substr(0, 10));

        });


        it('should return 404 when no dates given', test(function () {
            req.query.fromDate = undefined;
            req.query.toDate = undefined;

            Controller.getByDate(req, res);

            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return expected restaurants', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const mongoResponse = [
                { _id: '1', menus: []},
                { _id: '2', menus: ['test']},
            ];
            const filteredResponse = [
                { _id: '2', menus: ['test']},
            ];
            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec(undefined, mongoResponse)})),
            };
            Restaurant.find = sinon.stub().callsFake(() => populate);
            Controller.getByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );

            sinon.assert.calledWith(
                populate.populate,
                'menus', null, {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                    categories: { $in: expectedCategories }
                }
            );
            sinon.assert.calledWith(res.send, filteredResponse);
        }));

        it('should return 404 when no restaurants found', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec(undefined, undefined)})),
            };
            Restaurant.find = sinon.stub().callsFake(() => populate);
            Controller.getByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );

            sinon.assert.calledWith(
                populate.populate,
                'menus', null, {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                    categories: { $in: expectedCategories }
                }
            );
            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return 500 when error at restaurants find', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec('error', undefined)})),
            };
            Restaurant.find = sinon.stub().callsFake(() => populate);
            Controller.getByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.find,
                {}
            );

            sinon.assert.calledWith(
                populate.populate,
                'menus', null, {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                    categories: { $in: expectedCategories }
                }
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

    });

    describe('getRestaurantMenusByDate', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body;
            req.query.categories = 'vegan,vegetarisch';
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';
            start = new Date(req.query.fromDate.substr(0, 10));
            end = new Date(req.query.toDate.substr(0, 10));

        });


        it('should return 404 when no dates given', test(function () {
            req.query.fromDate = undefined;
            req.query.toDate = undefined;

            Controller.getRestaurantMenusByDate(req, res);

            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return expected restaurants', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const menus = ['test'];
            const mongoResponse = { _id: '2', menus: menus};
            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec(undefined, mongoResponse)})),
            };
            Restaurant.findOne = sinon.stub().callsFake(() => populate);
            Controller.getRestaurantMenusByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.findOne,
                {RID: req.params.id},
            );

            sinon.assert.calledWith(
                populate.populate,
                {
                    path: 'menus',
                    match: {
                        date: {
                            $gte: start,
                            $lte: end
                        },
                        categories: { $in: expectedCategories },
                    },
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                }
            );
            sinon.assert.calledWith(res.send, menus);
        }));

        it('should return 404 when no restaurant found', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec(undefined, undefined)})),
            };
            Restaurant.findOne = sinon.stub().callsFake(() => populate);
            Controller.getRestaurantMenusByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.findOne,
                {RID: req.params.id},
            );

            sinon.assert.calledWith(
                populate.populate,
                {
                    path: 'menus',
                    match: {
                        date: {
                            $gte: start,
                            $lte: end
                        },
                        categories: { $in: expectedCategories },
                    },
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                }
            );
            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return 500 when error at restaurant find', test(function () {
            const expectedCategories = ['vegan', 'vegetarisch'];

            const populate = {
                populate: sinon.stub().callsFake(() => ({exec: exec => exec('error', undefined)})),
            };
            Restaurant.findOne = sinon.stub().callsFake(() => populate);
            Controller.getRestaurantMenusByDate(req, res);
            sinon.assert.calledWith(
                Restaurant.findOne,
                {RID: req.params.id},
            );

            sinon.assert.calledWith(
                populate.populate,
                {
                    path: 'menus',
                    match: {
                        date: {
                            $gte: start,
                            $lte: end
                        },
                        categories: { $in: expectedCategories },
                    },
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                }
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));

    });

});