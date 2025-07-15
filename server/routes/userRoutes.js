const express = require('express');
const router = express.Router();
const { bindPhoneNumber } = require('../controllers/userController');

router.post('/phone', bindPhoneNumber);

module.exports = router; 