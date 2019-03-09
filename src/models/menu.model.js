const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const menuSchema = new Schema({
    RID: String,
    menus: [{
        price: Number,
        date: Date,
        courses: [{
            course: Number,
            description: String
        }]
    }]
});

module.exports = mongoose.model('Menu', menuSchema, 'menus');