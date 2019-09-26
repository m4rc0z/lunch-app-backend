const async = require('async');
const Category = require('./models/category.model');
const Menu = require('./models/menu.model');

const menuUtil = {};

menuUtil.removeLinkedCategoriesWhenUnused = (menu, model) => {
    console.log(Menu);
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
                    console.log(err);
                    throw new Error('menu post save error');
                }
            }
        );
};

module.exports = menuUtil;
