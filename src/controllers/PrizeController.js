const PrizeRepo = require("../repository/prize/PrizeRepo");
const Prize = require('../models/Prize');

const createPrize = async (req, res) => {
    try {
        const prizeData = req.body;

        const prize = new Prize(
            null,
            prizeData.eventId,
            prizeData.prizeName,
            prizeData.categoryId,
            prizeData.placement,
            prizeData.handedOut
        );

        const createdPrize = await PrizeRepo.createPrize(prize)
        console.log(createdPrize)

        if (!createdPrize) {
            return res.status(404).json({
                message: 'Event not found'
            });
        } else {
            return res.status(201).json({
                message: 'Prize created successfully',
                prize: createdPrize
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: e
        });
    }
}

const getPrizesForEvent = async (req, res) => {

    let { eventId } = req.params;

    try {
        eventId = Number(eventId);

        const prizes = await PrizeRepo.getPrizesByEventId(eventId)

        return res.status(201).json({
            message: 'Prizes from event retrieved successfully',
            prizes: prizes
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const getPrizeById = async (req, res) => {

    const { id } = req.params;

    try {
        const prize = await PrizeRepo.getPrizeById(id)
        return res.status(200).json({
            message: 'Prize with id retrieved successfully',
            prize: prize
        });
    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const editPrize = async (req, res) => {
    try {
        const prize = {
            id: req.body.id,
            prizeName: req.body.prizeName,
            eventId: req.body.eventId
        }

        const updatedPrize = await PrizeRepo.updatePrize(prize)

        // not sure if this is 400, but regardless find out eventually
        if (!updatedPrize) {
            return res.status(400).json({
                message: 'Categories updated unsuccessfully'
            })
        }

        return res.status(200).json({
            message: 'Categories updated successfully',
            updatedPrize: updatedPrize
        });

    } catch (e) {
        return res.status(500).json({
            message: 'Internal Server Error'
        });
    }
}

const deletePrize = async (req, res) => {
    try {
        let { id } = req.params;

        // Check that the category id was provided
        if (!id) {
            return res.status(400).json({
                message: 'Prize ID is required'
            });
        }

        try {
            id = Number(id)
        }
        catch (e) {
            return res.status(400).json({
                message: 'Prize ID must be a number'
            })
        }

        // Check if the category exists
        const existingPrize = await PrizeRepo.getPrizeById(id);
        if (!existingPrize) {
            return res.status(404).json({
                message: 'Category not found'
            });
        }

        // Delete category
        const rowsDeleted = await PrizeRepo.deletePrize(id);

        // Check to make sure the category was deleted
        if (rowsDeleted <= 0) {
            return res.status(404).json({
                message: 'Prize could not be deleted (not found or already removed)'
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
    createPrize,
    getPrizesForEvent,
    getPrizeById,
    editPrize,
    deletePrize
}