const restaurantUtil = require("../restaurant.util");

const async = require('async');
const ObjectId = require('mongoose').Types.ObjectId;
const Menu = require('../models/menu.model');
const Category = require('../models/category.model');
const Restaurant = require('../models/restaurant.model');

const Controller = {};
// TODO: make all these functions more robust (error proven)
Controller.getAll = function (req, res) {
    // TODO: check if this mocking only works because of return
    return Restaurant.find({})
        .populate({
                path: 'menus',
                populate: { // 2nd level subdoc (get users in comments)
                    path: 'categories',
                }
            }, // 1st level subdoc (get comments)
        )
        .exec(function (err, restaurants) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurants) {
                return res.status(404).end();
            } else {
                return res.send(restaurants);
            }
        });
};

Controller.getOne = function (req, res) {
    return Restaurant
        .findOneAndUpdate({RID: req.params.id}, {}, {
            upsert: true,
            new: true
        })
        .populate('menus').populate('categories')
        .exec(function (err, restaurant) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurant) {
                return res.status(404).end();
            } else {
                return res.send(restaurant);
            }
        });
};

Controller.getMenus = function (req, res) {
    return Restaurant
        .findOneAndUpdate({RID: req.params.id}, {}, {
            upsert: true,
            new: true
        }).populate({
                path: 'menus',
                populate: { // 2nd level subdoc (get users in comments)
                    path: 'categories',
                }
            }, // 1st level subdoc (get comments)
        )
        .exec(function (err, restaurant) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurant) {
                return res.status(404).end();
            } else {
                return res.send(restaurant);
            }
        });
};

Controller.update = function (req, res) {
    return Restaurant
        .findOneAndUpdate(
            {RID: req.params.id},
            req.body,
            {upsert: true, new: true},
        )
        .exec(function (err, restaurant) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurant) {
                return res.status(404).end();
            } else {
                return res.send(restaurant);
            }
        });
};

Controller.updateImage = function (req, res) {
    const image = {};
    image.url = req.file.url;
    image.id = req.file.public_id;
    return Restaurant
        .findOneAndUpdate(
            {RID: req.params.id},
            { imageUrl: image.url },
            {upsert: true, new: true},
        )
        .exec(function (err, restaurant) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurant) {
                return res.status(404).end();
            } else {
                return res.send(restaurant);
            }
        });
};

Controller.updateMenus = function (req, res) {
    Restaurant
        .findOneAndUpdate(
            {RID: req.params.id},
            {upsert: true, new: true},
        )
        .exec(function (err, restaurant) {
            if (err) {
                return res.send(500, err);
            } else {
                // TODO: refactor to specific function for better testability

                if (!restaurant) {
                    // TODO: adapt all to use send and not status
                    return res.send(404, 'restaurant not found');
                } else {
                    // async.mapLimit(req.body.menus, 1, (m, callback) => {
                    //         if (m.categories.filter(c => Boolean(c)).length > 0) {
                    //             async.mapLimit(m.categories.filter(c => Boolean(c)), 1, function (c, callback) {
                    //                 Category.findOneAndUpdate(
                    //                     {description: c.toLowerCase().trim()},
                    //                     {$set: {description: c.toLowerCase().trim()}},
                    //                     {new: true, upsert: true},
                    //                 ).exec(function (err, category) {
                    //                     callback(err, category);
                    //                 });
                    //             }, function (err, categories) {
                    //                 // code to run on completion or err
                    //                 if (err) {
                    //                     console.log(err);
                    //                     // TODO: handle error
                    //                 }
                    //
                    //                 const menuCategories = m.categories.map(cat => {
                    //                     return categories.find(c => c.description === cat.toLowerCase().trim());
                    //                 });
                    //                 callback(err, new Menu({
                    //                     _id: new ObjectId(), ...m,
                    //                     categories: menuCategories.map(category => {
                    //                         return category._id;
                    //                     })
                    //                 }));
                    //             });
                    //         } else {
                    //             callback(err, new Menu({
                    //                 _id: new ObjectId(), ...m, categories: [],
                    //             }));
                    //         }
                    //     },
                    //     function (err, menus) {
                    //         // code to run on completion or err
                    //         if (err) {
                    //             console.log(err);
                    //             // TODO: handle error
                    //         }
                    //         async.map(menus, (menu, callback) => {
                    //                 return menu.save((err, menu) => {
                    //                     if (err) {
                    //                         console.log(err);
                    //                         return res.send(500, err);
                    //                     }
                    //                     callback(err, menu);
                    //                 });
                    //             },
                    //             function (err, menus) {
                    //                 // code to run on completion or err
                    //                 if (!err) {
                    //                     // TODO: handle error
                    //                 } else {
                    //
                    //                 }
                    //
                    //
                    //                 menus.forEach(m => restaurant.menus.push(m._id));
                    //                 restaurant.save((err, restaurant) => {
                    //                     if (err) {
                    //                         return res.send(500, err);
                    //                     }
                    //
                    //                     restaurant.populate('menus').populate('categories').populate((err, populatedRestaurant) => {
                    //                         if (err) {
                    //                             res.send(500, err);
                    //                         } else {
                    //                             res.send(populatedRestaurant);
                    //                         }
                    //                     })
                    //                 });
                    //
                    //             }
                    //         );
                    //
                    //     }
                    // );

                    restaurantUtil.createOrUpdateMenus(
                        req && req.body && req.body.menus,
                        restaurant
                    )
                }
            }
        });
};


Controller.deleteMenus = function (req, res) {
    Restaurant.update(
        {RID: req.params.id},
        {
            $pull: {
                menus: {
                    $in: [...req.body.menus.map(m => new ObjectId(m._id))]
                }
            }
        },
        (err, menus) => {
            if (err) {
                return res.send(500, err);
            } else if (!menus) {
                return res.status(404).end();
            } else {
                Menu.find({
                        _id:
                            {$in: [...req.body.menus.map(m => new ObjectId(m._id))]}
                    },
                    (err, menus) => {
                        async.each(menus, (m, callback) => m.remove((err) => {
                            console.log(err);
                            callback(err || undefined);
                        }), (err) => {
                            if (err) {
                                return res.send(500, err);
                            } else {
                                return res.send(menus);
                            }
                        });
                    }
                );
            }
        });
};

module.exports = Controller;