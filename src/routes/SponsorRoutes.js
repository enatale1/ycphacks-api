const express = require('express');
const router = express.Router();

const { checkBodyForSpecialCharacters } = require('../middleware/validationMiddleware');
const EventSponsorController = require('../controllers/EventSponsorController');

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

module.exports = router;