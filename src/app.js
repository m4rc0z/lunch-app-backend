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

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mongoDB = `mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}`;
// const mongoDB = `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.createCollection('restaurants');
db.createCollection('menus');
db.createCollection('category');
// db.collections['menus'].deleteMany(); // TODO(before-release): remove this

app.use('/', indexRouter);
app.use('/authenticated/api/restaurants', authenticatedRestaurants);
app.use('/unauthenticated/api2/restaurants', unauthenticatedRestaurants);
app.use('/unauthenticated/api2/categories', unauthenticatedCategories);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
