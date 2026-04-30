const User = require('../models/User');
const { log } = require('../services/auditService');

exports.addMember = async (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) return res.status(400).json({ message: 'Email and role required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account found with that email' });

    const already = req.project.members.find((m) => m.userId.toString() === user._id.toString());
    if (already) return res.status(409).json({ message: 'User already a member' });

    req.project.members.push({ userId: user._id, role });
    await req.project.save();
    await req.project.populate('members.userId', 'name email avatar');

    await log({ projectId: req.project._id, userId: req.user._id, action: 'member_added', meta: { addedUserId: user._id, role } });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('member:added', { userId: user._id, role });

    res.status(201).json(req.project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMember = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ message: 'Role required' });

    const member = req.project.members.find((m) => m.userId._id.toString() === req.params.memberId || m.userId.toString() === req.params.memberId);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.role === 'owner') return res.status(403).json({ message: 'Cannot change owner role' });

    member.role = role;
    await req.project.save();

    await log({ projectId: req.project._id, userId: req.user._id, action: 'member_updated', meta: { memberId: req.params.memberId, newRole: role } });

    res.json(req.project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const member = req.project.members.find((m) => {
      const id = m.userId._id ? m.userId._id.toString() : m.userId.toString();
      return id === req.params.memberId;
    });
    if (!member) return res.status(404).json({ message: 'Member not found' });
    if (member.role === 'owner') return res.status(403).json({ message: 'Cannot remove owner' });

    req.project.members = req.project.members.filter((m) => {
      const id = m.userId._id ? m.userId._id.toString() : m.userId.toString();
      return id !== req.params.memberId;
    });
    await req.project.save();

    await log({ projectId: req.project._id, userId: req.user._id, action: 'member_removed', meta: { memberId: req.params.memberId } });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('member:removed', { userId: req.params.memberId });

    res.json(req.project.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
