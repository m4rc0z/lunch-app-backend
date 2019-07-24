const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;

const restaurantSchema = new Schema({
    _id: Schema.Types.ObjectId,
    RID: String,
    menus: [{ type: Schema.Types.ObjectId, ref: 'Menu'}]
});

module.exports = mongoose.model('Restaurant', restaurantSchema, 'restaurants');