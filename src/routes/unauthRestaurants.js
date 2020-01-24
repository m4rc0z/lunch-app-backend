const express = require('express');
const router = express.Router();
require('dotenv').load();

const Controller = require('../controllers/unauthRestaurant.controller');

router.get('/', Controller.getByDateAndCategory);
router.get('/:id/menus', Controller.getRestaurantMenusByDate);
router.get('/categories/', Controller.getCategories);

module.exports = router;
