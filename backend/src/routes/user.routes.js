const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authenticate = require('../middleware/authenticate');
console.log("--- ✅ [ROUTER] Wczytano router dla /api/users ---");

router.post('/', userController.createUser);
router.get('/me', authenticate, userController.getCurrentUser);

module.exports = router;