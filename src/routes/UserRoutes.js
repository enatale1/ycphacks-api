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
const { checkBodyForSpecialCharacters } = require('../middleware/validationMiddleware')

router.post('/validate-qr', validateQR);

router.post('/register', checkBodyForSpecialCharacters, createUser)

router.get('/:id/qrcode', createQRCode)

router.post('/login', checkBodyForSpecialCharacters, loginUser)

router.post('/admin-login', checkBodyForSpecialCharacters, loginAdminUser);

router.post('/auth', authWithToken)

router.get('/all', EventParticipantController.getUsersByEvent)

router.get('/event/:eventId/staff', EventParticipantController.getStaffForEvent);

router.put('/:id/checkin', updateCheckIn);

router.put('/:id', checkBodyForSpecialCharacters, updateUserById);

module.exports = router;