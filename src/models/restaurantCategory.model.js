const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const ObjectId = require('mongoose').Types.ObjectId;
const restaurantUtil = require("../restaurant.util");

const restaurantCategorySchema = new Schema({
    _id: ObjectId,
    description: String,
});

restaurantCategorySchema.post('remove', (restaurantCategory, next) => restaurantUtil.removeUsedRestaurantCategory(restaurantCategory, next));

module.exports = mongoose.model('RestaurantCategory', restaurantCategorySchema, 'restaurantCategory');