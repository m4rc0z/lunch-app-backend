const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
const Controller = require('./category.controller');
const Menu = require('../models/menu.model');
const Category = require('../models/category.model');

describe('Category Controller', function () {
    let req = {
            query: {}
        },
        res = {}, expectedResult;

    describe('getCategories', function () {
        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return 404 when no dates given', test(function () {
            req.query.fromDate = undefined;
            req.query.toDate = undefined;

            Controller.getCategories(req, res);

            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return expected categories', test(function () {
            const categories = [
                { _id: '1', description: 'vegan'},
                { _id: '2', description: 'vegerarisch'},
            ];
            this.stub(Category, 'find').returns({
                exec: exec => exec(undefined, categories)
            });
            this.stub(Menu, 'find').returns({
                count: exec => ({ exec: exec => exec(undefined, 3)})
            });
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';
            const start = new Date(req.query.fromDate.substr(0, 10));
            const end = new Date(req.query.toDate.substr(0, 10));

            Controller.getCategories(req, res);

            sinon.assert.calledWith(
                Category.find,
                {}
            );

            sinon.assert.calledWith(
                Menu.find,
                {
                    date: {
                        $gt: start,
                        $lt: end
                    },
                    categories: {$in: '1'}
                }
            );

            sinon.assert.calledWith(
                Menu.find,
                {
                    date: {
                        $gt: start,
                        $lt: end
                    },
                    categories: {$in: '2'}
                }
            );
            sinon.assert.calledWith(res.send, categories);
        }));

        it('should return no categories when not found in menus', test(function () {
            const categories = [
                { _id: '1', description: 'vegan'},
                { _id: '2', description: 'vegerarisch'},
            ];
            this.stub(Category, 'find').returns({
                exec: exec => exec(undefined, categories)
            });
            this.stub(Menu, 'find').returns({
                count: exec => ({ exec: exec => exec(undefined, 0)})
            });
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';
            const start = new Date(req.query.fromDate.substr(0, 10));
            const end = new Date(req.query.toDate.substr(0, 10));

            Controller.getCategories(req, res);

            sinon.assert.calledWith(
                Category.find,
                {}
            );

            sinon.assert.calledWith(
                Menu.find,
                {
                    date: {
                        $gt: start,
                        $lt: end
                    },
                    categories: {$in: '1'}
                }
            );

            sinon.assert.calledWith(
                Menu.find,
                {
                    date: {
                        $gt: start,
                        $lt: end
                    },
                    categories: {$in: '2'}
                }
            );
            sinon.assert.calledWith(res.send, []);
        }));


        it('should return 404 when no categories found', test(function () {
            this.stub(Category, 'find').returns({
                exec: exec => exec(undefined, undefined)
            });
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';

            Controller.getCategories(req, res);

            sinon.assert.calledWith(
                Category.find,
                {}
            );

            sinon.assert.calledWith(res.send, 404);
        }));

        it('should return 500 when error at categories find', test(function () {
            this.stub(Category, 'find').returns({
                exec: exec => exec('error', undefined)
            });
            req.query.fromDate = '2019-09-01T00:00:00.000';
            req.query.toDate = '2019-09-08T00:00:00.000';

            Controller.getCategories(req, res);

            sinon.assert.calledWith(
                Category.find,
                {}
            );

            sinon.assert.calledWith(res.send, 500, 'error');
        }));
    });
});