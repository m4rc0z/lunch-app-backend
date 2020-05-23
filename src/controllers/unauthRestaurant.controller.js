const Restaurant = require('../models/restaurant.model');
const RestaurantCategory = require('../models/restaurantCategory.model');
const ObjectId = require('mongoose').Types.ObjectId;
const Sentry = require('@sentry/node');
Sentry.init({
    dsn: 'https://81bba44887da42edb0456c9f9b3ebcab@sentry.io/1862646',
    beforeSend(event) {
        if (process.env.development) return null;
        return event;
    }
});
const Controller = {};

Controller.getByDateAndCategory = function (req, res) {
    try {
        if (!req.query || (!req.query.fromDate || !req.query.toDate)) {
            return res.send(404, 'not found');
        }
        const categories = req.query.categories && req.query.categories.split(',');
        const restaurantCategories = req.query.restaurantCategories && req.query.restaurantCategories.split(',');
        const start = new Date(req.query.fromDate.substr(0, 10));
        const end = new Date(req.query.toDate.substr(0, 10));
        // TODO: test if this is correct like that -> filtered correctly (check that time does get ignored)
        return Restaurant.find({...(restaurantCategories
            ? {categories: {$in: [...restaurantCategories.map(c => ObjectId(c))]}}
            : undefined
        )})
            .populate('menus', null, {
                    date: {
                        $gte: start,
                        $lte: end
                    },
                    ...(categories ? {categories: {$in: categories}} : undefined)
                }
            )
            .populate([
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
                    return res.send(restaurants.filter(restaurant => restaurant.menus.length > 0));
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        res.send(500, e);
    }
};

Controller.getRestaurantMenusByDate = function (req, res) {
    try {
        if (!req.query || (!req.query.fromDate || !req.query.toDate)) {
            return res.send(404, 'not found');
        }
        const start = new Date(req.query.fromDate.substr(0, 10));
        const end = new Date(req.query.toDate.substr(0, 10));
        const categories = req.query.categories && req.query.categories.split(',');
        return Restaurant
            .findOne({RID: req.params.id}, {}, {})
            .populate(
                [
                    {
                        path: 'menus',
                        match: {
                            date: {
                                $gte: start,
                                $lte: end
                            },
                            ...(categories ? {categories: {$in: categories}} : undefined)
                        },
                        populate: {
                            path: 'categories',
                        }
                    },
                    {
                        path: 'categories',
                        model: 'RestaurantCategory'
                    },
                ]
            )
            .exec(function (err, restaurant) {
                if (err) {
                    throw err;
                    return res.send(500, err);
                } else if (!restaurant) {
                    return res.send(404, 'not found');
                } else {
                    return res.send(restaurant.menus);
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
                    return res.send(categories || []);
                }
            });
    } catch (e) {
        Sentry.captureException(e);
        return res.send(500, e);
    }
};

module.exports = Controller;