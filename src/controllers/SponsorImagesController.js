const SponsorImage = require('../models/SponsorImage');
const SponsorRepo = require('../repository/sponsor/SponsorRepo');

const SponsorImagesController = {
    /**
     * Get all images for a specific sponsor.
     * @param {object} req - Express request object (expects req.params.sponsorId)
     * @param {object} res - Express response object
     * @returns {Promise<void>}
     */
    async getImagesBySponsorId(req, res) {
        try {
            const sponsorId = req.params.sponsorId;
            // Assuming SponsorRepo has a method to fetch images by sponsor ID
            const images = await SponsorRepo.getImagesBySponsorId(sponsorId);

            if (!images || images.length === 0) {
                // Return 200 with an empty array if no images are found, or 404 if you prefer strict REST
                return res.status(200).json([]);
                // return res.status(404).json({ message: "No images found for this sponsor" });
            }

            res.json(images);
        } catch (err) {
            console.error("Error fetching sponsor images: ", err);
            res.status(500).json({
                message: "Failed to fetch sponsor images",
                error: err.message
            });
        }
    },

    /**
     * Create a new image and link it to a sponsor.
     * @param {object} req - Express request object (expects req.body: { imageUrl, sponsorId })
     * @param {object} res - Express response object
     * @returns {Promise<void>}
     */
    async createImage(req, res) {
        try {
            const {
                imageUrl,
                sponsorId
            } = req.body;

            if (!imageUrl || !sponsorId) {
                return res.status(400).json({
                    message: "imageUrl and sponsorId are required"
                });
            }

            // Assuming SponsorRepo has a method to create a new sponsor image record
            const newImage = await SponsorRepo.createSponsorImage({
                imageUrl,
                sponsorId
            });

            res.status(201).json({
                message: "Image added successfully",
                image: newImage
            });
        } catch (err) {
            console.error("Error adding sponsor image: ", err);
            res.status(500).json({
                message: "Failed to add sponsor image",
                error: err.message
            });
        }
    },

    /**
     * Delete an image by its ID.
     * @param {object} req - Express request object (expects req.params.id)
     * @param {object} res - Express response object
     * @returns {Promise<void>}
     */
    async deleteImage(req, res) {
        try {
            const imageId = req.params.id;
            // Assuming SponsorRepo has a method to delete a sponsor image record
            const deleted = await SponsorRepo.deleteSponsorImage(imageId);

            if (deleted === 0) {
                return res.status(404).json({
                    message: "Image not found"
                });
            }

            res.json({
                message: "Image deleted successfully",
                result: deleted
            });
        } catch (err) {
            console.error("Error deleting sponsor image: ", err);
            res.status(500).json({
                message: "Failed to delete sponsor image",
                error: err.message
            });
        }
    }
};

module.exports = SponsorImagesController;