const express = require('express')
const router = express.Router()

const {
    createEvent,
    getAllEvents,
    getEventById,
    getActiveEvent,
    editEvent,
    deleteEvent,
    createActivity,
    getActivitiesForEvent,
    editActivity,
    updateEvent,
    deleteActivity
} = require('../controllers/EventController')

router.post('/create', createEvent)
router.get('/all', getAllEvents)
router.get('/active', getActiveEvent)
router.get('/:id', getEventById)
router.put('/update', editEvent)
router.delete('/delete/:id', deleteEvent)
router.post('/activity/', createActivity)
router.get('/activity/:id', getActivitiesForEvent)
router.delete('/activity/:id', deleteActivity)
router.put('/activity', editActivity)
router.put('/update', updateEvent)

module.exports = router;