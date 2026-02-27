const express = require('express')
const router = express.Router()

const {
    createPrize,
    getPrizesForEvent,
    getPrizeById,
    editPrize,
    deletePrize
} = require('../controllers/PrizeController');

router.post('/create', createPrize)
router.get('/by-event/:eventId', getPrizesForEvent)
router.get('/:id', getPrizeById)
router.put('/update', editPrize)
router.delete('/delete/:id', deletePrize)

module.exports = router;