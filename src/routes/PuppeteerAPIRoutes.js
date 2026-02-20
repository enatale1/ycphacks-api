const express = require('express');
const router = express.Router();

const PuppeteerController =  require('../controllers/PuppeteerController');

router.get('/teamPDF/:eventId', PuppeteerController.createPDF);
module.exports = router;