const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
console.log("--- ✅ [ROUTER] Wczytano router dla /api/users ---");

router.post('/', userController.createUser);

module.exports = router;