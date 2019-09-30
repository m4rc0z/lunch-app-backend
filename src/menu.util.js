const async = require('async');
const Category = require('./models/category.model');

const menuUtil = {};

menuUtil.removeLinkedCategoriesWhenUnused = (menu, model, next) => {
    try {
        async.each(menu.categories, (c, callback) => {
                model.find({categories: { $in: [c] }}).count().exec((err, count) => {
                    if (count === 0) {
                        Category.remove({_id: c}).exec((err, _) => {
                            callback(err || undefined);
                        })
                    } else {
                        callback(err);
                    }
                })
            },
            (err) => {
                if (err) {
                    next(new Error('menu post save error ' + err));
                }
            }
        );
    } catch(e) {
        next(new Error('menu post save error ' + e));
    }
};

module.exports = menuUtil;
