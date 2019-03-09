require('../models/menu.model');
const mongoose = require("mongoose");
const Menu = mongoose.model('Menu');

const Controller = {};

Controller.get = function (req, res) {
    return Menu.find({RID: req.user.sub})
        .exec(function (err, menus) {
            if (err) {
                return res.send(500, err);
            } else if (!menus) {
                return res.status(404).end();
            } else {
                return res.send(menus[0]);
            }
        });
};

Controller.update = function (req, res) {
    return Menu
        .findOneAndUpdate(
            {RID: req.user.sub},
            {$addToSet: {menus: req.body}},
            {upsert: true}
        )
        .exec(function (err, menus) {
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