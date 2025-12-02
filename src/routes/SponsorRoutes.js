const express = require('express');
const router = express.Router();

const { checkBodyForSpecialCharacters } = require('../middleware/validationMiddleware');
const EventSponsorController = require('../controllers/EventSponsorController');
const {createImage, deleteImage, getImagesBySponsorId} = require("../controllers/SponsorImagesController");
const upload = require("../controllers/UploadController");

router.get("/", EventSponsorController.getEventSponsors);
router.post("/", 
    checkBodyForSpecialCharacters,
    EventSponsorController.addSponsorToEvent);
router.put("/:id", 
    checkBodyForSpecialCharacters,
    EventSponsorController.updateEventSponsor);
router.delete("/:id", 
    checkBodyForSpecialCharacters,
    EventSponsorController.removeEventSponsor);
router.get("/tiers", EventSponsorController.getSponsorTiers);
router.put("/tiers/:id", EventSponsorController.updateSponsorTier);
router.post("/tiers", EventSponsorController.addSponsorTier);
router.delete("/tiers/:id", EventSponsorController.removeSponsorTier);
router.get("/by-event/:eventId", EventSponsorController.getSponsorsByEvent);

router.post("/images",
    checkBodyForSpecialCharacters,
    createImage);
router.delete("/images/:id",
    checkBodyForSpecialCharacters,
    deleteImage);
router.get("/:sponsorId/images", getImagesBySponsorId);
router.post("/",
    checkBodyForSpecialCharacters,
    EventSponsorController.addSponsorToEvent);
router.get("/by-event/:eventId", EventSponsorController.getSponsorsByEvent);
router.get("/", EventSponsorController.getEventSponsors);
router.put("/:id",
    checkBodyForSpecialCharacters,
    EventSponsorController.updateEventSponsor);
router.delete("/:id",
    checkBodyForSpecialCharacters,
    EventSponsorController.removeEventSponsor);
router.get("/tiers", EventSponsorController.getSponsorTiers);
router.put("/tiers/:id",
    checkBodyForSpecialCharacters,
    EventSponsorController.updateSponsorTier);
router.post("/tiers",
    checkBodyForSpecialCharacters,
    EventSponsorController.addSponsorTier);
router.delete("/tiers/:id",
    checkBodyForSpecialCharacters,
    EventSponsorController.removeSponsorTier);
module.exports = router;