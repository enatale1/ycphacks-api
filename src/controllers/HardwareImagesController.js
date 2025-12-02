const HardwareImage = require('../models/HardwareImage');
const HardwareRepo = require('../repository/hardware/HardwareRepo');

const HardwareImageController = {
    // Get all images for a specific hardware
    async getImagesByHardwareId(req, res) {
        try {
            const hardwareId = req.params.hardwareId;
            const images = await HardwareRepo.getImagesByHardwareId(hardwareId);

            if (!images || images.length === 0) {
                return res.status(404).json({ message: "No images found for this hardware" });
            }

            res.json(images);
        } catch (err) {
            console.error("Error fetching hardware images: ", err);
            res.status(500).json({ message: "Failed to fetch hardware images", error: err.message });
        }
    },

    // Create a new hardware image
    async createImage(req, res) {
        try {
            const { imageUrl, hardwareId } = req.body;

            if (!imageUrl || !hardwareId) {
                return res.status(400).json({ message: "imageUrl and hardwareId are required" });
            }

            const newImage = await HardwareRepo.createHardwareImage({
                imageUrl,
                hardwareId
            });

            res.status(201).json({ message: "Image added successfully", image: newImage });
        } catch (err) {
            console.error("Error adding hardware image: ", err);
            res.status(500).json({ message: "Failed to add hardware image", error: err.message });
        }
    },

    // Delete an image by ID
    async deleteImage(req, res) {
        try {
            const imageId = req.params.id;
            const deleted = await HardwareRepo.deleteHardwareImage(imageId);

            res.json({ message: "Image deleted successfully", result: deleted });
        } catch (err) {
            console.error("Error deleting hardware image: ", err);
            res.status(500).json({ message: "Failed to delete hardware image", error: err.message });
        }
    }
};

module.exports = HardwareImageController;
