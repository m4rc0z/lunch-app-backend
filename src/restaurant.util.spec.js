const sinon = require('sinon');
const sinonTest = require('sinon-test');
const test = sinonTest(sinon);
let restaurantUtil = require("./restaurant.util");
const ObjectId = require('mongoose').Types.ObjectId;

describe('Restaurant Util', function () {
    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('saveRestaurant', function () {
        it('should call callback with 500 when errors', test(function () {
            const callback = sandbox.stub();
            const restaurant = {
                save: sandbox.stub().callsFake((cb) => {
                    cb('error', undefined);
                })
            };

            restaurantUtil.saveRestaurant(restaurant, callback);

            sinon.assert.called(
                restaurant.save,
            );
            sinon.assert.calledWith(
                callback,
                500,
                'error'
            );
        }));

        it('should call populate when no errors', test(function () {
            const callback = sandbox.stub();
            const populatedRestaurant = 'newRestaurant';
            const restaurantResult = {
                populate: sandbox.stub().returns({
                    populate: sandbox.stub().returns({
                        populate: sandbox.stub().callsFake((cb) => {
                            cb(undefined, populatedRestaurant);
                        })
                    })
                })
            };
            const restaurant = {
                save: sandbox.stub().callsFake((cb) => {
                    cb(undefined, restaurantResult);
                })
            };

            restaurantUtil.saveRestaurant(restaurant, callback);

            sinon.assert.called(
                restaurant.save,
            );
            sinon.assert.calledWith(
                callback,
                populatedRestaurant,
            );
        }));

        it('should call callback with 500 when errors at population', test(function () {
            const callback = sandbox.stub();
            const restaurantResult = {
                populate: sandbox.stub().returns({
                    populate: sandbox.stub().returns({
                        populate: sandbox.stub().callsFake((cb) => {
                            cb('error', undefined);
                        })
                    })
                })
            };
            const restaurant = {
                save: sandbox.stub().callsFake((cb) => {
                    cb(undefined, restaurantResult);
                })
            };

            restaurantUtil.saveRestaurant(restaurant, callback);

            sinon.assert.called(
                restaurant.save,
            );
            sinon.assert.calledWith(
                callback,
                500,
                'error'
            );
        }));
    });

    describe('createOrUpdateMenus', function () {

        it('should call createOrUpdateCategories when categories are available', test(function () {
            const menus = [
                {categories: ['test']},
                {categories: ['test2']}
            ];
            const expectedObjectId = new ObjectId();
            sandbox.stub(restaurantUtil, 'saveRestaurantAndMenus');
            sandbox.stub(restaurantUtil, 'createOrUpdateCategories').callsFake((c, m, cb) => {
                cb(undefined, { _id: expectedObjectId });
            });

            restaurantUtil.createOrUpdateMenus(menus, undefined);

            sinon.assert.calledWith(
                restaurantUtil.createOrUpdateCategories,
                menus[0].categories
            );
            sinon.assert.calledWith(
                restaurantUtil.createOrUpdateCategories,
                menus[1].categories
            );
            sinon.assert.calledWith(
                restaurantUtil.saveRestaurantAndMenus,
                [{ _id: expectedObjectId }, { _id: expectedObjectId }],
                undefined,
                undefined
            );
        }));

        it('should call saveRestaurantAndMenus when no categories are available', test(function () {
            const menus = [
                {courses: [], categories: []},
                {courses: [], categories: []}
            ];
            sandbox.stub(restaurantUtil,'saveRestaurantAndMenus');
            sandbox.stub(restaurantUtil, 'createOrUpdateCategories');

            restaurantUtil.createOrUpdateMenus(menus, undefined);

            sinon.assert.called(
                restaurantUtil.saveRestaurantAndMenus,
            );
            sinon.assert.notCalled(
                restaurantUtil.createOrUpdateCategories,
            );
        }));

        it('should call callback with 500 when errors', test(function () {
            const menus = [
                {courses: [], categories: ['vegan']},
                {courses: [], categories: []}
            ];
            const send = sandbox.stub();

            sandbox.stub(restaurantUtil, 'saveRestaurantAndMenus');

            sandbox.stub(restaurantUtil, 'createOrUpdateCategories').callsFake((c, m, cb) => {
                cb('error', undefined);
            });

            restaurantUtil.createOrUpdateMenus(menus, undefined, send);

            sinon.assert.called(
                restaurantUtil.createOrUpdateCategories,
            );
            sinon.assert.calledWith(
                send,
                500,
                'error'
            );
        }));
    });

    describe('createOrUpdateCategories', function () {
        it('should call createOrUpdateCategory when categories are available', test(function () {
            const categories = ['vegan', 'vegetarisch'];
            sandbox.stub(restaurantUtil, 'createOrUpdateCategory');

            restaurantUtil.createOrUpdateCategories(categories);

            sinon.assert.calledWith(
                restaurantUtil.createOrUpdateCategory,
                categories[0]
            );
            sinon.assert.calledWith(
                restaurantUtil.createOrUpdateCategory,
                categories[1]
            );
        }));

        it('should not call createOrUpdateCategory when categories are not available', test(function () {
            const categories = [undefined, ''];
            const callback = sandbox.stub();
            const m = {_id: 'test'};
            sandbox.stub(restaurantUtil, 'createOrUpdateCategory');

            restaurantUtil.createOrUpdateCategories(categories, m, callback);

            sinon.assert.calledWithMatch(
                callback,
                undefined,
                sinon.match(actual => actual.categories.length === 0)
            );
            sinon.assert.notCalled(
                restaurantUtil.createOrUpdateCategory,
            );
        }));

        it('should call callback with correct menu when categories are available', test(function () {
            const categories = ['vegan', 'vegetarisch', undefined];
            const callback = sandbox.stub();
            const m = {_id: 'test', courses: ['a']};
            const expectedObjectId = new ObjectId();
            sandbox.stub(restaurantUtil, 'createOrUpdateCategory').callsFake((c, cb) => {
                cb(undefined, {_id: expectedObjectId, description: 'vegan'});
            });

            restaurantUtil.createOrUpdateCategories(categories, m, callback);

            sinon.assert.calledWithMatch(
                callback,
                null,
                sinon.match(actual =>
                    actual.categories.length > 0
                    && actual.categories[0] === expectedObjectId
                )
            );
            sinon.assert.called(
                restaurantUtil.createOrUpdateCategory,
            );
        }));

        it('should call callback with error when error happens', test(function () {
            const categories = ['vegan', 'vegetarisch', undefined];
            const callback = sandbox.stub();
            const m = {_id: 'test', courses: ['a']};
            sandbox.stub(restaurantUtil, 'createOrUpdateCategory').callsFake((c, cb) => {
                cb('error');
            });

            restaurantUtil.createOrUpdateCategories(categories, m, callback);

            sinon.assert.calledWithMatch(
                callback,
                'error'
            );
            sinon.assert.called(
                restaurantUtil.createOrUpdateCategory,
            );
        }));
    });
    describe('saveRestaurantAndMenus', function () {
        it('should call saveMenu when menus are available', test(function () {
            const menus = ['a', 'b'];
            const callback = sandbox.stub();
            const restaurant = 'test';
            sandbox.stub(restaurantUtil, 'saveMenu');

            restaurantUtil.saveRestaurantAndMenus(menus, restaurant, callback);

            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[0],
            );
            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[1],
            );
        }));

        it('should call saveRestaurant when no errors', test(function () {
            const menus = ['a', 'b'];
            const send = 'testfunction';
            const restaurant = {menus: []};

            const expectedObjectId = new ObjectId();
            sandbox.stub(restaurantUtil, 'saveMenu').callsFake((m, cb) => {
                cb(undefined, { _id: expectedObjectId });
            });

            sandbox.stub(restaurantUtil, 'saveRestaurant');

            restaurantUtil.saveRestaurantAndMenus(menus, restaurant, send);

            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[0],
            );
            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[1],
            );
            sinon.assert.calledWith(
                restaurantUtil.saveRestaurant,
                {menus: [expectedObjectId, expectedObjectId]},
                send
            );
        }));

        it('should call callback with 500 when errors', test(function () {
            const menus = ['a', 'b'];
            const send = sandbox.stub();
            const restaurant = {menus: []};

            sandbox.stub(restaurantUtil, 'saveMenu').callsFake((m, cb) => {
                cb('error', undefined);
            });

            restaurantUtil.saveRestaurantAndMenus(menus, restaurant, send);

            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[0],
            );
            sinon.assert.calledWith(
                restaurantUtil.saveMenu,
                menus[1],
            );
            sinon.assert.calledWith(
                send,
                500,
                'error'
            );
        }));
    });
});