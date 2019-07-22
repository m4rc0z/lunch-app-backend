require('../models/restaurant.model');
const mongoose = require("mongoose");
const Restaurant = mongoose.model('Restaurant');
const Menu = mongoose.model('Menu');
const ObjectId = require('mongoose').Types.ObjectId;

const Controller = {};

// TODO: check how to verify if admin -> when admin then its possible to request all restaurants
// TODO: user specific route with id for specific restaurants
Controller.getAll = function (req, res) {
    return Restaurant.find({})
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

Controller.get = function (req, res) {
    // if (!req.isAdmin && req.user.sub !== req.params.id) {
    //      return res.send(401, 'not allowed to request data');
    // }
    // RID = auth0 id = id of url
    // objectid is private -> TODO: check if this id needs to be transfered to the frontend or if its only in the backend available
    return Restaurant
        .findOneAndUpdate({RID: req.params.id}, {}, {
            upsert: true,
            new: true
        })
        .populate('menus')
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
    // TODO: add check if own menus are requested or if admin
    return Restaurant
        .findOneAndUpdate({RID: req.params.id}, {}, {
            upsert: true,
            new: true
        }).populate('menus')
        .exec(function (err, restaurant) {
            // TODO: add this handling to specific function which is unit tested separately
            if (err) {
                return res.send(500, err);
            } else if (!restaurant) {
                return res.status(404).end();
            } else {
                return res.send(restaurant);
            }
        });
};

// This is to update restaurant data
Controller.update = function (req, res) {
    // TODO(2): check how to update restaurant data
    return Restaurant
        .findOneAndUpdate(
            {RID: req.params.id},
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
                const menus = req.body.menus.map(m => new Menu({_id: new ObjectId(), ...m}));
                menus.map(menu => {
                    console.log('menu', menu);
                    return menu.save((err) => {
                        if (err) {
                            return res.send(500, err).end();
                        }
                    });
                });
                if (!restaurant) {
                    return res.send(404, 'restaurant not found').end();
                }

                menus.map(m => restaurant.menus.push(m._id));
                restaurant.save((err, restaurant) => {
                    if (err) {
                        return res.send(500, err).end();// TODO: this is not pssible when error already happened at line 96
                    }

                    restaurant.populate('menus').populate((err, populatedRestaurant) => {
                        if (err) {
                            res.send(500, err).end();
                        } else {
                            res.send(populatedRestaurant);
                        }
                    })
                });

            }
        });
};


Controller.deleteMenus = function (req, res) {
    console.log(req.body.menus.map(m => new ObjectId(m._id)));
    Restaurant.update(
        {RID: req.params.id},
        {
            $pull: {
                menus: {
                    $in: [...req.body.menus.map(m => new ObjectId(m._id))]
                }
            }
        })
        .exec((err, menus) => {
            if (err) {
                return res.send(500, err);
            } else if (!menus) {
                return res.status(404).end();
            } else {
                return res.send(menus);
            }
        });
};

module.exports = Controller;