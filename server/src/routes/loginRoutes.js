const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

router.post('/login', loginController.login);
router.get('/profile', loginController.profile);
router.get('/logout', loginController.logout);

module.exports = router;
