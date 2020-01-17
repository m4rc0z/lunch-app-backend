const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const restaurantSchema = new Schema({
    _id: Schema.Types.ObjectId,
    RID: String,
    name: String,
    address: String,
    postalCode: String,
    city: String,
    latitude: Number,
    longitude: Number,
    imageUrl: String,
    mapImageUrl: String,
    openingTimesLine1: String,
    openingTimesLine2: String,
    menus: [{ type: Schema.Types.ObjectId, ref: 'Menu'}]
});

module.exports = mongoose.model('Restaurant', restaurantSchema, 'restaurants');