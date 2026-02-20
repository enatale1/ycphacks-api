const EventCategoryRepo = require("../repository/event/EventCategoryRepo");
const EventCategory = require('../models/EventCategory');

const createCategory = async (req, res) => {
    try {
        const categoryData = req.body;

        const category = new EventCategory(
            null,
            categoryData.categoryName,
            categoryData.eventId
        );

        const createdCategory = await EventCategoryRepo.createCategory(category)

        if (!createdCategory) {
            return res.status(404).json({
                message: 'Event not found'
            });
        } else {
            return res.status(201).json({
                message: 'Category created successfully',
                category: createdCategory
            });
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({
            message: e
        });
    }
}

const getCategoriesForEvent = async (req, res) => {

    let { eventId } = req.params;

    try {
        eventId = Number(eventId);

        const categories = await EventCategoryRepo.getCategoriesByEventId(eventId)
        return res.status(200).json({
            message: 'Categories from event retrieved successfully',
            categories: categories
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const getCategoryById = async (req, res) => {

    const { id } = req.params;

    try {
        const categories = await EventCategoryRepo.getCategoryById(id)
        return res.status(200).json({
            message: 'Category with id retrieved successfully',
            categories: categories
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const editCategory = async (req, res) => {
    try {
        const category = {
            id: req.body.id,
            categoryName: req.body.categoryName,
            eventId: req.body.eventId
        }

        const updatedCategory = await EventCategoryRepo.updateCategory(category)

        // not sure if this is 400, but regardless find out eventually
        if (!updatedCategory) {
            return res.status(400).json({
                message: 'Categories updated unsuccessfully'
            })
        }

        return res.status(200).json({
            message: 'Categories updated successfully',
        });

    } catch (e) {
        console.error(e);
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const deleteCategory = async (req, res) => {
    try {
        let { id } = req.params;

        // Check that the category id was provided
        if (!id) {
            return res.status(400).json({
                message: 'Category ID is required'
            });
        }

        try {
            id = Number(id)
        }
        catch (e) {
            return res.status(400).json({
                message: 'Category ID must be a number'
            })
        }

        // Check if the category exists
        const existingCategory = await EventCategoryRepo.getCategoryById(id);
        if (!existingCategory) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Delete category
        const rowsDeleted = await EventCategoryRepo.deleteCategory(id);

        // Check to make sure the category was deleted
        if (rowsDeleted <= 0) {
            return res.status(404).json({
                message: 'Category could not be deleted (not found or already removed)'
            });
        }

        return res.status(200).json({
            message: 'Category deleted successfully',
            deletedId: id
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Error deleting category',
            error: e.message || e
        });
    }
}

module.exports = {
    createCategory,
    getCategoriesForEvent,
    getCategoryById,
    editCategory,
    deleteCategory
}