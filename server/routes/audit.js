const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProjectRole, requireRole } = require('../middleware/roleCheck');
const { getProjectAudit, getAllAudit } = require('../controllers/auditController');

router.get('/audit/all', auth, getAllAudit);
router.get('/:id/audit', auth, getProjectRole, requireRole('viewer'), getProjectAudit);

module.exports = router;
