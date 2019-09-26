const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const ObjectId = require('mongoose').Types.ObjectId;
const menuUtil = require("../menu.util");

const menuSchema = new Schema({
    _id: ObjectId,
    price: String,
    date: Date,
    courses: [{
        course: Number,
        description: String
    }],
    categories: [{type: Schema.Types.ObjectId, ref: 'Category'}]
});

menuSchema.post('remove', menu => menuUtil.removeLinkedCategoriesWhenUnused(menu, mongoose.model('Menu', menuSchema, 'menus')));

const model = mongoose.model('Menu', menuSchema, 'menus');


module.exports = model;