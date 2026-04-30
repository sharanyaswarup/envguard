const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProjectRole, requireRole } = require('../middleware/roleCheck');
const { addMember, updateMember, removeMember } = require('../controllers/teamController');

router.post('/:id/team', auth, getProjectRole, requireRole('admin'), addMember);
router.put('/:id/team/:memberId', auth, getProjectRole, requireRole('admin'), updateMember);
router.delete('/:id/team/:memberId', auth, getProjectRole, requireRole('admin'), removeMember);

module.exports = router;
