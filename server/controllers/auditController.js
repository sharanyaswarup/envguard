const AuditLog = require('../models/AuditLog');
const Project = require('../models/Project');

exports.getProjectAudit = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find({ projectId: req.project._id })
      .populate('userId', 'name email avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments({ projectId: req.project._id });

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllAudit = async (req, res) => {
  try {
    const userProjects = await Project.find({ 'members.userId': req.user._id }).select('_id name');
    const projectIds = userProjects.map((p) => p._id);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const filter = { projectId: { $in: projectIds } };
    if (req.query.action) filter.action = req.query.action;

    const logs = await AuditLog.find(filter)
      .populate('userId', 'name email avatar')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(filter);

    res.json({ logs, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
