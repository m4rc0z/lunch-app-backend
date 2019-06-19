const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const ObjectId = require('mongoose').Types.ObjectId;
const menuSchema = new Schema({
    _id: ObjectId,
    RID: String,
    menus: [{
        _id: ObjectId,
        price: Number,
        date: Date,
        courses: [{
            course: Number,
            description: String
        }]
    }],
});

module.exports = mongoose.model('Menu', menuSchema, 'menus');