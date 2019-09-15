const Menu = require('../models/menu.model');
const Category = require('../models/category.model');
const async = require('async');
const mongodb = require('mongodb');

const Controller = {};

Controller.getCategories = function (req, res) {
    if (!req.query.fromDate || !req.query.toDate) {
        return res.status(404).end();
    }
    const start = new Date(req.query.fromDate.substr(0, 10));
    const end = new Date(req.query.toDate.substr(0, 10));

    return Category
        .find({})
        .exec(function (err, categories) {
            // TODO: add this handling to specific function which is unit tested separately
            if (err) {
                return res.send(500, err);
            } else if (!categories) {
                return res.status(404).end();
            } else {
                // TODO: check if categories are included inside date range
                async.filter(
                    categories,
                    (c, callback) => {
                        Menu.find({
                            date: {
                                $gt: start,
                                $lt: end
                            },
                            categories: {$in: c._id}
                        }).count().exec((err, count) => {
                            console.log(count > 0);
                            callback(err, count > 0);
                        });
                    },
                    (err, filteredCategories) => {
                        console.log('fc', filteredCategories);
                        return res.send(filteredCategories || []);
                    }
                );
            }
        });
};

module.exports = Controller;