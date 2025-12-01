const express = require('express');
const router = express.Router();

const {
    createUser,
    loginUser,
    loginAdminUser,
    authWithToken,
    getAllUsers, updateCheckIn, updateUserById
} = require('../controllers/UserController')
const EventParticipantController= require('../controllers/EventParticipantsController')

router.post('/register', createUser)

router.post('/login', loginUser)

router.post('/admin-login', loginAdminUser);

router.post('/auth', authWithToken)
console.log("--- userRoutes.js LOADED ---"); 
console.log("getUsersByEvent type:", typeof getUsersByEvent); // <--- CRITICAL CHECK

router.get('/all', EventParticipantController.getUsersByEvent)

router.put('/:id/checkin', updateCheckIn);

router.put('/:id', updateUserById);

module.exports = router;