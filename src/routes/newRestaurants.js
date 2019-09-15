const express = require('express');
const router = express.Router();
require('dotenv').load();

const Controller = require('../controllers/newRestaurant.controller');

// router.get('/', Controller.getAll);
router.get('/', Controller.getByDate);
router.get('/:id/menus', Controller.getRestaurantMenusByDate);

module.exports = router;
