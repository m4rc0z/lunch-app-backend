const async = require('async');
const Category = require('./models/category.model');
const Menu = require('./models/menu.model');
const ObjectId = require('mongoose').Types.ObjectId;

const restaurantUtil = {};

restaurantUtil.saveMenu = (menu, callback) => {
    return menu.save((err, menu) => {
        callback(err, menu);
    });
};

restaurantUtil.saveRestaurant = (restaurant, res) => {
    restaurant.save((err, restaurant) => {
        if (err) {
            return res.send(500, err);
        }

        restaurant.populate('menus').populate('categories').populate((err, populatedRestaurant) => {
            if (err) {
                res.send(500, err);
            } else {
                res.send(populatedRestaurant);
            }
        })
    });
};
restaurantUtil.saveRestaurantAndMenus = (menusToSave, restaurant, res) => {
    async.map(
        menusToSave,
        (menu, callback) => restaurantUtil.saveMenu(menu, callback),
        function (err, menus) {
            // code to run on completion or err
            if (err) {
                res.send(500, err);
            } else {
                menus.forEach(m => restaurant.menus.push(m._id));
                restaurantUtil.saveRestaurant(restaurant, res)
            }
        }
    );
};

restaurantUtil.createOrUpdateCategory = (category, callback) => {
    Category.findOneAndUpdate(
        {description: category.toLowerCase().trim()},
        {$set: {description: category.toLowerCase().trim()}},
        {new: true, upsert: true},
    ).exec(function (err, category) {
        callback(err, category);
    });
};
restaurantUtil.createOrUpdateCategories = (menuCategories, menu, callback) => {
    const filteredCategories = menuCategories.filter(c => Boolean(c));
    if (filteredCategories.length > 0) {
        async.mapLimit(filteredCategories, filteredCategories.length, function (c, callback) {
            restaurantUtil.createOrUpdateCategory(c, callback);
        }, function (err, categories) {
            // code to run on completion or err
            if (err) {
                callback(err);
            } else {
                const menuCats = filteredCategories
                    .map(cat => {
                        return categories.find(c => c.description === cat.toLowerCase().trim());
                    })
                    .filter(c => Boolean(c));

                callback(err, new Menu({
                    _id: new ObjectId(), ...menu,
                    ...{categories: menuCats.map(category => {
                            return category._id;
                        })}
                }));
            }
        });
    } else {
        callback(undefined, new Menu({
            _id: new ObjectId(), ...menu,
            categories: [],
        }));
    }
};

restaurantUtil.createOrUpdateMenus = (menus, restaurant, res) => {
    async.mapLimit(menus, menus.length, (m, callback) => {
            if (m.categories.filter(c => Boolean(c)).length > 0) {
                restaurantUtil.createOrUpdateCategories(m.categories, m, callback);
            } else {
                callback(undefined, new Menu({
                    _id: new ObjectId(), ...m, categories: [],
                }));
            }
        },
        function (err, menus) {
            // code to run on completion or err
            if (err) {
                res.send(500, err)
            } else {
                restaurantUtil.saveRestaurantAndMenus(menus, restaurant, res);
            }
        }
    );
};

module.exports = restaurantUtil;
