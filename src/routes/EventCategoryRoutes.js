const express = require('express')
const router = express.Router()

const {
    createCategory,
    getCategoriesForEvent,
    getCategoryById,
    editCategory,
    deleteCategory
} = require('../controllers/EventCategoryController');

router.post('/create', createCategory)
router.get('/by-event/:eventId', getCategoriesForEvent)
router.get('/:id', getCategoryById)
router.put('/update', editCategory)
router.delete('/delete/:id', deleteCategory)

module.exports = router;