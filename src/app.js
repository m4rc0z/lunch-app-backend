const createError = require('http-errors');
const express = require('express');
const app = express();
const mongoose = require("mongoose");
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const indexRouter = require('./routes');
const authenticatedRestaurants = require('./routes/restaurants');
const unauthenticatedRestaurants = require('./routes/unauthRestaurants');
const unauthenticatedCategories = require('./routes/categories');
const Sentry = require('@sentry/node');

Sentry.init({ dsn: 'https://81bba44887da42edb0456c9f9b3ebcab@sentry.io/1862646' });
app.use(Sentry.Handlers.requestHandler());

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongoDB = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
mongoose.connect(mongoDB, {useNewUrlParser: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;

db.on('error', (err) => {
    if (err.message && err.message.match(/failed to connect to server .* on first connect/)) {
        console.log(new Date(), String(err));

        // Wait for a bit, then try to connect again
        setTimeout(function () {
            console.log("Retrying first connect");
            mongoose.connect(mongoDB, {useNewUrlParser: true});
        }, 20000);
    } else {
        console.error(new Date(), String(err));
    }
});

db.createCollection('restaurants');
db.createCollection('menus');
db.createCollection('category');

app.use('/', indexRouter);
app.use('/authenticated/api/restaurants', authenticatedRestaurants);
app.use('/unauthenticated/api/restaurants', unauthenticatedRestaurants);
app.use('/unauthenticated/api/categories', unauthenticatedCategories);

app.use(function(req, res, next) {
    next(createError(404));
});
// catch 404 and forward to error handler
app.use(Sentry.Handlers.errorHandler());

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  Sentry.captureException(err);

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
