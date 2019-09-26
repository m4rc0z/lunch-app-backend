const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
let menuUtil = require("./menu.util");
const Category = require("./models/category.model");
const chai = require('chai');
const expect = chai.expect;

describe('Menu Util', function () {
    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('removeLinkedCategoriesWhenUnused', function () {
        it('should call remove when menu category count is zero', test(function () {
            const menu = {
                categories: ['testid1', 'testid2'],
            };
            sandbox.stub(Category, 'remove')
                .callsFake(() => ({exec: exec => exec(undefined, undefined)}));
            const menuModel = {
                find: () => undefined,
            };
            sandbox.stub(menuModel, 'find').returns({
                count: sandbox.stub()
                    .returns(({exec: exec => exec(undefined, 0)}))
            });

            menuUtil.removeLinkedCategoriesWhenUnused(menu, menuModel);

            sinon.assert.calledWith(
                menuModel.find,
                {categories: {$in: ['testid1']}}
            );
            sinon.assert.calledWith(
                menuModel.find,
                {categories: {$in: ['testid2']}}
            );
            sinon.assert.calledWith(
                Category.remove,
                {_id: 'testid1'}
            );
            sinon.assert.calledWith(
                Category.remove,
                {_id: 'testid2'}
            );
        }));
        it('should not call remove when menu category count is non-zero', test(function () {
            const menu = {
                categories: ['testid1', 'testid2'],
            };
            sandbox.stub(Category, 'remove')
                .callsFake(() => ({exec: exec => exec(undefined, undefined)}));
            const menuModel = {
                find: () => undefined,
            };
            sandbox.stub(menuModel, 'find').returns({
                count: sandbox.stub()
                    .returns(({exec: exec => exec(undefined, 1)}))
            });
            menuUtil.removeLinkedCategoriesWhenUnused(menu, menuModel);

            sinon.assert.calledWith(
                menuModel.find,
                {categories: {$in: ['testid1']}}
            );
            sinon.assert.calledWith(
                menuModel.find,
                {categories: {$in: ['testid2']}}
            );
            sinon.assert.notCalled(
                Category.remove,
            );
        }));
        it('should call remove when menu category count is zero', test(function () {
                const menu = {
                    categories: ['testid1', 'testid2'],
                };

                sandbox.stub(Category, 'remove')
                    .callsFake(() => ({exec: exec => exec('error', undefined)}));
                const menuModel = {
                    find: () => undefined,
                };
                sandbox.stub(menuModel, 'find').returns({
                    count: sandbox.stub()
                        .returns(({exec: exec => exec(undefined, 0)}))
                });

                expect(menuUtil.removeLinkedCategoriesWhenUnused.bind(menuUtil, menu, menuModel)).to.throw('menu post save error');

                sinon.assert.calledWith(
                    menuModel.find,
                    {categories: {$in: ['testid1']}}
                );
                sinon.assert.called(
                    Category.remove,
                );
            })
        );
        it('should not call remove when menu category count is non-zero', test(function () {
            const menu = {
                categories: ['testid1', 'testid2'],
            };
            sandbox.stub(Category, 'remove')
                .callsFake(() => ({exec: exec => exec(undefined, undefined)}));
            const menuModel = {
                find: () => undefined,
            };
            sandbox.stub(menuModel, 'find').returns({
                count: sandbox.stub()
                    .returns(({exec: exec => exec('error', 1)}))
            });

            expect(menuUtil.removeLinkedCategoriesWhenUnused.bind(menuUtil, menu, menuModel)).to.throw('menu post save error');

            sinon.assert.calledWith(
                menuModel.find,
                {categories: {$in: ['testid1']}}
            );
            sinon.assert.notCalled(
                Category.remove,
            );
        }));
    })
    ;

})
;