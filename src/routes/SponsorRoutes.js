const express = require('express');
const router = express.Router();


const {
    checkBodyForSpecialCharacters
} = require('../middleware/validationMiddleware');

const {
    getEventSponsors,
    addSponsorToEvent,
    updateEventSponsor,
    removeEventSponsor,
    getSponsorTiers,
    removeSponsorTier,
    getSponsorsByEvent,
    updateSponsorTier,
    addSponsorTier
} = require('../controllers/EventSponsorController');


const {
    createImage,
    deleteImage,
    getImagesBySponsorId
} = require("../controllers/SponsorImagesController");


router.get("/", getEventSponsors);
router.post("/", checkBodyForSpecialCharacters, addSponsorToEvent);

router.get("/:id/images", getImagesBySponsorId);
router.put("/:id", checkBodyForSpecialCharacters, updateEventSponsor);
router.delete("/:id", checkBodyForSpecialCharacters, removeEventSponsor);

router.get("/by-event/:eventId", getSponsorsByEvent);

router.get("/tiers", getSponsorTiers);
router.post("/tiers", checkBodyForSpecialCharacters, addSponsorTier);

router.put("/tiers/:id", checkBodyForSpecialCharacters, updateSponsorTier);
router.delete("/tiers/:id", removeSponsorTier);

router.post("/images", checkBodyForSpecialCharacters, createImage);
router.delete("/images/:id", checkBodyForSpecialCharacters, deleteImage);



module.exports = router;