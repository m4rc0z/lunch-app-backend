const Menu = require('../models/menu.model');
const Restaurant = require('../models/restaurant.model');
const ObjectId = require('mongoose').Types.ObjectId;

const Controller = {};

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
                        return res.send(500, err).end();
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