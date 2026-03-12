const express = require('express');
const router = express.Router();

const UserController = require("../controllers/UserController");

router.get('/verify-email', UserController.updateEmailVerification);
module.exports = router;