const express = require('express');
const router = express.Router();

const UserController = require("../controllers/UserController");
const EmailUtil = require("../util/emailService")

router.get('/verify-email', UserController.updateEmailVerification);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword)
router.post('/resendVerification', UserController.resendVerification)
module.exports = router;