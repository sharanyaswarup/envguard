const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProjectRole, requireRole } = require('../middleware/roleCheck');
const { listSecrets, revealSecret, createSecret, updateSecret, deleteSecret, importSecrets, exportSecrets } = require('../controllers/secretController');

const base = '/:id/secrets';

router.get(base, auth, getProjectRole, requireRole('viewer'), listSecrets);
router.get(`${base}/export`, auth, getProjectRole, requireRole('editor'), exportSecrets);
router.get(`${base}/:secretId/reveal`, auth, getProjectRole, requireRole('viewer'), revealSecret);
router.post(base, auth, getProjectRole, requireRole('editor'), createSecret);
router.post(`${base}/import`, auth, getProjectRole, requireRole('editor'), importSecrets);
router.put(`${base}/:secretId`, auth, getProjectRole, requireRole('editor'), updateSecret);
router.delete(`${base}/:secretId`, auth, getProjectRole, requireRole('admin'), deleteSecret);

module.exports = router;
