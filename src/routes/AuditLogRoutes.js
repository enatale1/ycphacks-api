const express = require('express')
const router = express.Router()
const { getAllLogs } = require('../controllers/AuditLogController')

router.post('/search', getAllLogs);

module.exports = router;