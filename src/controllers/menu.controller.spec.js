const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
const Controller = require('./menu.controller');
const Menu = require('../models/menu.model');

describe('Menu Controller', function () {
    let req = {
            body: {
                menus: undefined,
            },
            user: {
                sub: '1'
            }
        },
        res = {}, expectedResult;

    describe('get', function () {

        beforeEach(function () {
            res = {
                send: sinon.spy(),
                status: sinon.stub().returns({end: sinon.spy()})
            };
            expectedResult = req.body
        });

        it('should return expected menus', test(function () {
            const expectedMenu = {name: 'menu'};
            this.stub(Menu, 'find').returns({
                exec: exec => exec(undefined, [expectedMenu])
            });
            Controller.get(req, res);
            sinon.assert.calledWith(Menu.find, {RID: req.user.sub});
            sinon.assert.calledWith(res.send, expectedMenu);
        }));

        it('should return correct status for not found menus', test(function () {
            this.stub(Menu, 'find').returns({
                exec: exec => exec(undefined, undefined)
            });
            Controller.get(req, res);
            sinon.assert.calledWith(Menu.find, {RID: req.user.sub});
            sinon.assert.calledWith(res.status, 404);
        }));

        it('should return correct status for error', test(function () {
            this.stub(Menu, 'find').returns({
                exec: exec => exec('test error', undefined)
            });
            Controller.get(req, res);
            sinon.assert.calledWith(Menu.find, {RID: req.user.sub});
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

        it('should return updated menus', test(function () {
            const expectedMenu = {name: 'menu'};
            this.stub(Menu, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, expectedMenu)
            });
            Controller.update(req, res);
            sinon.assert.calledWith(Menu.findOneAndUpdate,
                {RID: req.user.sub},
                {$addToSet: {menus: req.body}},
                {upsert: true}
            );
            sinon.assert.calledWith(res.send, expectedMenu);
        }));

        it('should return correct status for not found menus', test(function () {
            this.stub(Menu, 'findOneAndUpdate').returns({
                exec: exec => exec(undefined, undefined)
            });
            Controller.update(req, res);
            sinon.assert.calledWith(Menu.findOneAndUpdate,
                {RID: req.user.sub},
                {$addToSet: {menus: req.body}},
                {upsert: true}
            );
            sinon.assert.calledWith(res.status, 404);
        }));


        it('should return correct status for error', test(function () {
            this.stub(Menu, 'findOneAndUpdate').returns({
                exec: exec => exec('error', undefined)
            });
            Controller.update(req, res);
            sinon.assert.calledWith(Menu.findOneAndUpdate,
                {RID: req.user.sub},
                {$addToSet: {menus: req.body}},
                {upsert: true}
            );
            sinon.assert.calledWith(res.send, 500, 'error');
        }));


    });

});