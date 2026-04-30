const Project = require('../models/Project');

const ROLE_HIERARCHY = {
  owner: 4,
  admin: 3,
  editor: 2,
  viewer: 1,
};

const getProjectRole = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members.userId', 'name email avatar');
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const member = project.members.find(
      (m) => m.userId && m.userId._id.toString() === req.user._id.toString()
    );

    if (!member) {
      return res.status(403).json({ message: 'Access denied' });
    }

    req.project = project;
    req.userRole = member.role;
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const requireRole = (minRole) => (req, res, next) => {
  const userLevel = ROLE_HIERARCHY[req.userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[minRole] || 0;
  if (userLevel < requiredLevel) {
    return res.status(403).json({ message: `Requires ${minRole} role or higher` });
  }
  next();
};

module.exports = { getProjectRole, requireRole };
