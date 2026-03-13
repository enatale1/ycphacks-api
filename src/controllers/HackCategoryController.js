const EventRepo = require('../repository/event/EventRepo')
const HackCategoryRepo = require("../repository/category/HackCategoryRepo");
const HackCategory = require('../models/HackCategory');

const createCategory = async (req, res) => {
    const categoryData = req.body;

    const category = new HackCategory(
        null,
        categoryData.categoryName,
        categoryData.eventId
    );

    const validationErrors = category.validate(true);
    if (Object.keys(validationErrors).length > 0) {
        return res.status(400).json({
            message: "Validation errors occured",
            errors: validationErrors
        });
    }

    try {
        const eventIdNotFound = !(await EventRepo.findEventById(category.eventId));
        if (eventIdNotFound) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const createdCategory = await HackCategoryRepo.createCategory(category)

        if (!createdCategory) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        } else {
            return res.status(201).json({
                message: 'Category created successfully',
                category: createdCategory
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: "Internal Server Error"
        });
    }
}

const getCategoriesForEvent = async (req, res) => {

    let { eventId } = req.params;
    eventId = Number(eventId);

    if (!Number.isInteger(eventId) || eventId < 1) {
        return res.status(400).json({
            message: "Validation errors occurred",
            errors: {eventId: 'EventId provided is not a valid, positive integer'},
        });
    }

    try {
        const eventIdNotFound = !(await EventRepo.findEventById(eventId));
        if (eventIdNotFound) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        const categories = await HackCategoryRepo.getCategoriesByEventId(eventId);

        return res.status(201).json({
            message: 'Categories for event retrieved successfully',
            categories: categories
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const getCategoryById = async (req, res) => {

    let { id } = req.params;
    id = Number(id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Validation errors occurred",
            errors: {eventId: 'Id provided is not a valid, positive integer'},
        });
    }

    try {

        const category = await HackCategoryRepo.getCategoryById(id)
        if (!category) {
            return res.status(404).json({
                message: "Category not found"
            })
        }

        return res.status(201).json({
            message: 'Category with id retrieved successfully',
            category: category
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const editCategory = async (req, res) => {
    try {
        const category = new HackCategory(
            req.body.id,
            req.body.categoryName,
            req.body.eventId
        );

        const validationErrors = category.validate(false);
        if (Object.keys(validationErrors.errors).length > 0) {
            return res.status(400).json({
                message: "Validation errors occured",
                errors: categoryIsValid.errors,
            });
        }

        const categoryNotFound = !(await HackCategoryRepo.getCategoryById(category.id));
        if (categoryNotFound) {
            return res.status(404).json({
                message: "Category not found"
            })
        }

        const updatedCategory = await HackCategoryRepo.updateCategory(category)

        // not sure if this is 400, but regardless find out eventually
        if (!updatedCategory) {
            return res.status(400).json({
                message: 'Categories updated unsuccessfully'
            })
        }

        return res.status(200).json({
            message: 'Categories updated successfully',
            updatedCategory: updatedCategory
        });

    } catch (e) {
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
        const existingCategory = await HackCategoryRepo.getCategoryById(id);
        if (!existingCategory) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Delete category
        const rowsDeleted = await HackCategoryRepo.deleteCategory(id);

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
            error: e.message || "Internal Server Error"
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