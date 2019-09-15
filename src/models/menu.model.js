const mongoose = require("mongoose");
const Schema = require("mongoose").Schema;
const Category = require('../models/category.model');
const ObjectId = require('mongoose').Types.ObjectId;
const async = require('async');

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

menuSchema.post('remove', removeLinkedCategoriesWhenUnused);

const model = mongoose.model('Menu', menuSchema, 'menus');

function removeLinkedCategoriesWhenUnused(doc) {
    async.each(doc.categories, (c, callback) => {
            model.find({categories: { $in: [c] }}).count().exec((err, count) => {
                if (count === 0) {
                    Category.remove({_id: c}).exec((err, _) => {
                        callback(err || undefined);
                    })
                } else {
                    callback();
                }
            })
        },
        (err) => {
            if (err) {
                // TODO: handle error
                console.log(err)
            }
        }
    );
}

module.exports = model;