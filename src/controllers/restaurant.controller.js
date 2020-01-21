const async = require('async');
const ObjectId = require('mongoose').Types.ObjectId;
const Menu = require('../models/menu.model');
const restaurantUtil = require("../restaurant.util");
const Restaurant = require('../models/restaurant.model');
const RestaurantCategory = require('../models/restaurantCategory.model');
const Sentry = require('@sentry/node');
Sentry.init({
    dsn: 'https://81bba44887da42edb0456c9f9b3ebcab@sentry.io/1862646',
    beforeSend(event) {
        if (process.env.development) return null;
        return event;
    }
});
const Controller = {};
Controller.getAll = function (req, res) {
    try {
        return Restaurant.find({})
            .populate([
                {
                    path: 'menus',
                    populate: {
                        path: 'categories',
                    }
                },
                {
                    path: 'categories',
                    model: 'RestaurantCategory'
                },
            ])
            .exec(function (err, restaurants) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurants) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurants);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.getOne = function (req, res) {
    try {
        return Restaurant
            .findOneAndUpdate({RID: req.params.id}, {}, {
                upsert: true,
                new: true
            })
            .populate([
                {
                    path: 'menus',
                    populate: {
                        path: 'categories',
                    }
                },
                {
                    path: 'categories',
                    model: 'RestaurantCategory'
                },
            ])
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.getMenus = function (req, res) {
    try {
        return Restaurant
            .findOneAndUpdate({RID: req.params.id}, {}, {
                upsert: true,
                new: true
            })
            .populate([
                {
                    path: 'menus',
                    populate: {
                        path: 'categories',
                    }
                },
                {
                    path: 'categories',
                    model: 'RestaurantCategory'
                },
            ])
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.update = function (req, res) {
    try {
        const restaurant = req.body;
        restaurant.categories = restaurant.categories.map(c => new ObjectId(c));
        return Restaurant
            .findOneAndUpdate(
                {RID: req.params.id},
                restaurant,
                {upsert: true, new: true},
            )
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.updateCategories = function (req, res) {
    try {
        return RestaurantCategory
            .find({})
            .exec(function (err, categories) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!categories) {
                    return res.send(404, 'not found');
                } else {
                    categories.forEach(category => {
                       const foundCategory = req.body.find(c => c === category.description);
                       if (!foundCategory) {
                           // delete category aus BE
                           category.remove((err, _) => {
                               if (err) {
                                   return res.send(500, err);
                               }
                           });
                       }
                    });
                    async.each(
                        req.body
                        .filter(sentCategory => !categories.some(c => c.description === sentCategory)),
                        (category, callback) => {
                            RestaurantCategory.findOneAndUpdate(
                                {description: category},
                                {description: category},
                                {upsert: true, new: true},
                                (err, _) => {
                                    callback(err || undefined);
                                }
                            );
                        }, (err) => {
                            if (err) {
                                throw err;
                                return res.send(500, err);
                            } else {
                                RestaurantCategory
                                    .find({}).exec((err, categories) => {
                                    if (err) {
                                        throw err;
                                        return res.send(500, err);
                                    } else if (!categories) {
                                        return res.send(404, 'not found');
                                    } else {
                                        return res.send(categories);
                                    }
                                });
                            }
                        });
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.getCategories = function (req, res) {
    try {
        return RestaurantCategory
            .find({})
            .exec(function (err, categories) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!categories) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(categories);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.updateImage = function (req, res) {
    try {
        const image = {};
        image.url = req.file.url;
        image.id = req.file.public_id;
        return Restaurant
            .findOneAndUpdate(
                {RID: req.params.id},
                {imageUrl: image.url},
                {upsert: true, new: true},
            )
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.updateMapImage = function (req, res) {
    try {
        const image = {};
        image.url = req.file.url;
        image.id = req.file.public_id;
        return Restaurant
            .findOneAndUpdate(
                {RID: req.params.id},
                {mapImageUrl: image.url},
                {upsert: true, new: true},
            )
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

Controller.updateMenus = function (req, res) {
    try {
        Restaurant
            .findOneAndUpdate(
                {RID: req.params.id},
                {upsert: true, new: true},
            )
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else {
                    if (!restaurant) {
                        return res.send(404, 'restaurant not found');
                    } else {
                        restaurantUtil.createOrUpdateMenus(
                            req && req.body && req.body.menus,
                            restaurant,
                            res,
                        )
                    }
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};


Controller.deleteMenus = function (req, res) {
    try {
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
                    throw err;
                    return res.send(500, err);
                } else if (!menus) {
                    return res.send(404, 'not found');
                } else {
                    Menu.find({
                            _id:
                                {$in: [...req.body.menus.map(m => new ObjectId(m._id))]}
                        },
                        (err, menus) => {
                            async.each(menus, (m, callback) => {
                                Menu.remove({_id: m._id}, (err, _) => {
                                    callback(err || undefined);
                                });
                            }, (err) => {
                                if (err) {
                                    throw err;
                                    return res.send(500, err);
                                } else {
                                    return res.send(menus);
                                }
                            });
                        }
                    );
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

module.exports = Controller;