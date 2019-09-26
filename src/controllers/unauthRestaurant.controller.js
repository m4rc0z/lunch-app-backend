const Restaurant = require('../models/restaurant.model');
const Menu = require('../models/menu.model');
const Category = require('../models/category.model');
const mongodb = require('mongodb');
const ObjectId = require('mongoose').Types.ObjectId;

const Controller = {};

// TODO: check if this function is needed
Controller.getAll = function (req, res) {
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

// TODO: make this null save and error prove
Controller.getByDate = function (req, res) {
    if (!req.query.fromDate || !req.query.toDate) {
        return res.status(404).end();
    }
    const categories = req.query.categories && req.query.categories.split(',');
    const start = new Date(req.query.fromDate.substr(0, 10));
    const end = new Date(req.query.toDate.substr(0, 10));
    // TODO: test if this is correct like that -> filtered correctly (check that time does get ignored)
    return Restaurant.find({})
        .populate('menus', null, {
                date: {
                    $gt: start,
                    $lt: end
                },
                ...(categories ? {categories: { $all: categories }} : undefined)
            }
        )
        .exec(function (err, restaurants) {
            if (err) {
                return res.send(500, err);
            } else if (!restaurants) {
                return res.status(404).end();
            } else {
                return res.send(restaurants.filter(restaurant => restaurant.menus.length > 0));
            }
        });
};

// TODO: make this null save and error prove
Controller.getRestaurantMenusByDate = function (req, res) {
    if (!req.query.fromDate || !req.query.toDate) {
        return res.status(404).end();
    }
    const start = new Date(req.query.fromDate.substr(0, 10));
    const end = new Date(req.query.toDate.substr(0, 10));
    const categories = req.query.categories && req.query.categories.split(',');
    return Restaurant
        .findOne({RID: req.params.id}, {}, {
        })
        .populate({
                path: 'menus',
                match: {
                    date: {
                        $gt: start,
                        $lt: end
                    },
                    ...(categories ? {categories: { $all: categories }} : undefined)
                },
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
                return res.send(restaurant.menus);
            }
        });
};

module.exports = Controller;