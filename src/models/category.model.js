const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const ObjectId = require('mongoose').Types.ObjectId;

const categorySchema = new Schema({
    _id: ObjectId,
    description: String,
});

module.exports = mongoose.model('Category', categorySchema, 'category');