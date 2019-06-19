require('../models/menu.model');
const mongoose = require("mongoose");
const Menu = mongoose.model('Menu');
const ObjectId = require('mongoose').Types.ObjectId;

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
            {$addToSet: {menus: req.body.map(m => ({ _id: new ObjectId(), ...m}))}},
            {upsert: true, new: true},
        )
        .exec(function (err, menus) {
            if (err) {
                return res.send(500, err);
            } else {
                return res.send(menus);

            }
        });
};

Controller.delete = function (req, res) {
    console.log(req.body.menus.map(m => new ObjectId(m._id)));
    Menu.update(
        {'_id': new ObjectId(req.body.restaurantId)},
        {
            $pull: {
                menus: {
                    '_id': {$in: [...req.body.menus.map(m => new ObjectId(m._id))]}
                }
            }
        },
        function (err, menus) {
            console.log(menus);
            return res.send(menus);
        }
    );
};

module.exports = Controller;