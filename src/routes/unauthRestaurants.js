const express = require('express');
const router = express.Router();
require('dotenv').load();

const Controller = require('../controllers/unauthRestaurant.controller');

// TODO: check if getAll is needed
// router.get('/', Controller.getAll);
router.get('/', Controller.getByDate);
router.get('/:id/menus', Controller.getRestaurantMenusByDate);

module.exports = router;
