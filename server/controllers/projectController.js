const Project = require('../models/Project');
const Secret = require('../models/Secret');
const AuditLog = require('../models/AuditLog');

const COLORS = ['#00d4ff', '#00ffaa', '#ff4d6d', '#ffb347', '#a78bfa', '#34d399', '#fb7185', '#60a5fa'];

exports.listProjects = async (req, res) => {
  try {
    const projects = await Project.find({ 'members.userId': req.user._id })
      .populate('members.userId', 'name email avatar')
      .sort({ updatedAt: -1 });

    const projectsWithCount = await Promise.all(projects.map(async (p) => {
      const secretCount = await Secret.countDocuments({ projectId: p._id });
      return { ...p.toObject(), secretCount };
    }));

    res.json(projectsWithCount);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const project = await Project.create({
      name,
      description: description || '',
      color,
      members: [{ userId: req.user._id, role: 'owner' }],
    });

    await project.populate('members.userId', 'name email avatar');
    res.status(201).json({ ...project.toObject(), secretCount: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const secretCount = await Secret.countDocuments({ projectId: req.project._id });
    res.json({ ...req.project.toObject(), secretCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (name) req.project.name = name;
    if (description !== undefined) req.project.description = description;
    await req.project.save();
    res.json(req.project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    await Secret.deleteMany({ projectId: req.project._id });
    await AuditLog.deleteMany({ projectId: req.project._id });
    await req.project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
