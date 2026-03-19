const express = require('express');
const router = express.Router();

const {
    createUser,
    createQRCode,
    loginUser,
    loginAdminUser,
    authWithToken,
    getAllUsers, updateCheckIn, updateUserById, validateQR, getUserInfo
} = require('../controllers/UserController')
const EventParticipantController= require('../controllers/EventParticipantsController')
const { checkBodyForSpecialCharacters } = require('../middleware/validationMiddleware')
const { authMiddleware } = require('../middleware/authMiddleware')

// Protected
router.post('/validate-qr', authMiddleware, validateQR);

// Public
router.post('/register', checkBodyForSpecialCharacters, createUser);

// Protected
router.get('/:id/qrcode', authMiddleware, createQRCode);

router.get('/:id/info', authMiddleware, getUserInfo);

// Public
router.post('/login', checkBodyForSpecialCharacters, loginUser);

// Public
router.post('/admin-login', checkBodyForSpecialCharacters, loginAdminUser);

// Protected
router.post('/auth', authMiddleware, authWithToken);

// Protected
router.get('/all', authMiddleware, EventParticipantController.getUsersByEvent);

// Public
router.get('/event/:eventId/staff', EventParticipantController.getStaffForEvent);

// Protected
router.put('/:id/checkin', authMiddleware, updateCheckIn);

// Protected
router.put('/:id', authMiddleware, checkBodyForSpecialCharacters, updateUserById);


module.exports = router;