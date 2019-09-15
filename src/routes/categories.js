const express = require('express');
const router = express.Router();
require('dotenv').load();

const Controller = require('../controllers/category.controller');

router.get('/', Controller.getCategories);

module.exports = router;
