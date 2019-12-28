const async = require('async');
const ObjectId = require('mongoose').Types.ObjectId;
const Menu = require('../models/menu.model');
const restaurantUtil = require("../restaurant.util");
const Restaurant = require('../models/restaurant.model');
const Sentry = require('@sentry/node');
Sentry.init({ dsn: 'https://81bba44887da42edb0456c9f9b3ebcab@sentry.io/1862646' });
const Controller = {};
Controller.getAll = function (req, res) {
    try {
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
                    Sentry.captureException(err);
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
            .populate('menus').populate('categories')
            .exec(function (err, restaurant) {
                if (err) {
                    Sentry.captureException(err);
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
            }).populate({
                    path: 'menus',
                    populate: { // 2nd level subdoc (get users in comments)
                        path: 'categories',
                    }
                }, // 1st level subdoc (get comments)
            )
            .exec(function (err, restaurant) {
                if (err) {
                    Sentry.captureException(err);
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
        return Restaurant
            .findOneAndUpdate(
                {RID: req.params.id},
                req.body,
                {upsert: true, new: true},
            )
            .exec(function (err, restaurant) {
                if (err) {
                    Sentry.captureException(err);
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
                    Sentry.captureException(err);
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
                    Sentry.captureException(err);
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
                    Sentry.captureException(err);
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
                                    Sentry.captureException(err);
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