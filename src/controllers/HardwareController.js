const HardwareRepo = require('../repository/hardware/HardwareRepo');
const Hardware = require('../models/Hardware');


const HardwareController = {
    async getHardwareById(req, res) {
        try{
            const hardware = await HardwareRepo.findHardwareById(req.params.id);
            if(!hardware) return res.status(404).json({ message: "Hardware not found" });
            res.json(hardware);
        }catch(err){
            console.error("Error fetching grouped hardware list: ", err);
            res.status(500).json({ message: "Failed to fetch hardware" });
        }
    },

    async getAllHardware(req, res) {
        try {
            const groupedHardware = await HardwareRepo.groupHardware();
            res.json(groupedHardware);
        } catch (err) {
            console.error("Error fetching grouped hardware list: ", err);
            res.status(500).json({ error: err.message || "Failed to retrieve grouped hardware." });
        }
    },
    async getAllHardwareAdmin(req, res) {
        try {
            const hardware = await HardwareRepo.findAllHardwareAdmin();
            res.json(hardware);
        } catch (err) {
            console.error("Error fetching hardware : ", err);
            res.status(500).json({ error: err.message || "Failed to retrieve hardware." });
        }
    },
    async getHardwareAvailability(req, res){
        try{
            const availabilityList = await HardwareRepo.getAvailabilityList();
            res.json(availabilityList);
        }catch(err){
            console.error("Error fetching hardware availability list: ", err);
            res.status(500).json({ error: err.message || "Failed to retrieve hardware availability." });
        }
    },
        async createHardware(req, res) {
            try {
                console.log("Incoming hardware body:", req.body);
                const newHardware = await HardwareRepo.createHardware({
                    hardwareName: req.body.hardwareName,
                    serial: req.body.serial,
                    functional: req.body.functional,
                    description: req.body.description,
                });

                res.status(201).json({
                    message: "Hardware added successfully",
                    hardware: newHardware,
                    id: newHardware.id // <--- Add this! (Assuming your Sequelize model populates 'id')
                });

            } catch (err) {
                console.error("Error adding hardware:", err);
                res.status(500).json({ message: "Failed to add hardware", error: err.message });
            }
        },

    async updateHardware(req, res) {
        try {
            const updated = await HardwareRepo.updateHardware(req.params.id, {
                hardwareName: req.body.name,
                serial: req.body.serial,
                status: req.body.status,
                functional: req.body.functional,
                description: req.body.description,

               // whoHasID: req.body.whoHasID ? Number(req.body.whoHasID) : null,
            });
            res.json({ message: "Hardware updated successfully", result: updated });
        } catch (err) {
            console.error("Error updating hardware:", err);
            res.status(500).json({ message: "Failed to update hardware", error: err.message });
        }
    },
    async deleteHardware(req, res) {
        try {
            const deleted = await HardwareRepo.deleteHardware(req.params.id);
            res.json({ message: "Hardware deleted successfully", result: deleted });
        } catch (err) {
            console.error("Error deleting hardware:", err);
            res.status(500).json({ message: "Failed to delete hardware", error: err.message });
        }
    },
}

module.exports = HardwareController;