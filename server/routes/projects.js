const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProjectRole, requireRole } = require('../middleware/roleCheck');
const { listProjects, createProject, getProject, updateProject, deleteProject } = require('../controllers/projectController');

router.get('/', auth, listProjects);
router.post('/', auth, createProject);
router.get('/:id', auth, getProjectRole, getProject);
router.put('/:id', auth, getProjectRole, requireRole('admin'), updateProject);
router.delete('/:id', auth, getProjectRole, requireRole('owner'), deleteProject);

module.exports = router;
