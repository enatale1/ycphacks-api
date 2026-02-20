const express = require('express');
const router = express.Router();

const {
    createUser,
    createQRCode,
    loginUser,
    loginAdminUser,
    authWithToken,
    getAllUsers, updateCheckIn, updateUserById, validateQR
} = require('../controllers/UserController')
const EventParticipantController= require('../controllers/EventParticipantsController')

router.post('/validate-qr', validateQR);

router.post('/register', createUser)

router.get('/:id/qrcode', createQRCode)

router.post('/login', loginUser)

router.post('/admin-login', loginAdminUser);

router.post('/auth', authWithToken)

router.get('/all', EventParticipantController.getUsersByEvent)

router.get('/event/:eventId/staff', EventParticipantController.getStaffForEvent);

router.put('/:id/checkin', updateCheckIn);

router.put('/:id', updateUserById);

module.exports = router;