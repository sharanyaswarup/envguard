const Secret = require('../models/Secret');
const { encrypt, decrypt } = require('../services/encryptionService');
const { log } = require('../services/auditService');

exports.listSecrets = async (req, res) => {
  try {
    const secrets = await Secret.find({ projectId: req.project._id })
      .populate('createdBy', 'name avatar')
      .populate('updatedBy', 'name avatar')
      .sort({ createdAt: -1 });

    const safeSecrets = secrets.map((s) => ({
      _id: s._id,
      key: s.key,
      value: '••••••••',
      createdBy: s.createdBy,
      updatedBy: s.updatedBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    res.json(safeSecrets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.revealSecret = async (req, res) => {
  try {
    const secret = await Secret.findOne({ _id: req.params.secretId, projectId: req.project._id });
    if (!secret) return res.status(404).json({ message: 'Secret not found' });

    const value = decrypt(secret.encryptedValue, secret.iv);

    await log({
      projectId: req.project._id,
      userId: req.user._id,
      action: 'view',
      targetKey: secret.key,
    });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('secret:viewed', { key: secret.key, userId: req.user._id });

    res.json({ value });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSecret = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key || value === undefined) return res.status(400).json({ message: 'Key and value required' });

    const upperKey = key.toUpperCase().trim();
    const { encryptedValue, iv } = encrypt(value);

    const secret = await Secret.create({
      projectId: req.project._id,
      key: upperKey,
      encryptedValue,
      iv,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });

    await secret.populate('createdBy', 'name avatar');
    await secret.populate('updatedBy', 'name avatar');

    await log({ projectId: req.project._id, userId: req.user._id, action: 'create', targetKey: upperKey });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('secret:created', {
      _id: secret._id, key: secret.key, value: '••••••••',
      createdBy: secret.createdBy, updatedBy: secret.updatedBy,
      createdAt: secret.createdAt, updatedAt: secret.updatedAt,
    });

    res.status(201).json({
      _id: secret._id, key: secret.key, value: '••••••••',
      createdBy: secret.createdBy, updatedBy: secret.updatedBy,
      createdAt: secret.createdAt, updatedAt: secret.updatedAt,
    });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Key already exists in this project' });
    res.status(500).json({ message: err.message });
  }
};

exports.updateSecret = async (req, res) => {
  try {
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ message: 'Value required' });

    const secret = await Secret.findOne({ _id: req.params.secretId, projectId: req.project._id });
    if (!secret) return res.status(404).json({ message: 'Secret not found' });

    const { encryptedValue, iv } = encrypt(value);
    secret.encryptedValue = encryptedValue;
    secret.iv = iv;
    secret.updatedBy = req.user._id;
    await secret.save();
    await secret.populate('createdBy', 'name avatar');
    await secret.populate('updatedBy', 'name avatar');

    await log({ projectId: req.project._id, userId: req.user._id, action: 'update', targetKey: secret.key });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('secret:updated', {
      _id: secret._id, key: secret.key, value: '••••••••',
      createdBy: secret.createdBy, updatedBy: secret.updatedBy,
      createdAt: secret.createdAt, updatedAt: secret.updatedAt,
    });

    res.json({
      _id: secret._id, key: secret.key, value: '••••••••',
      createdBy: secret.createdBy, updatedBy: secret.updatedBy,
      createdAt: secret.createdAt, updatedAt: secret.updatedAt,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSecret = async (req, res) => {
  try {
    const secret = await Secret.findOne({ _id: req.params.secretId, projectId: req.project._id });
    if (!secret) return res.status(404).json({ message: 'Secret not found' });

    const key = secret.key;
    await secret.deleteOne();

    await log({ projectId: req.project._id, userId: req.user._id, action: 'delete', targetKey: key });

    const io = req.app.get('io');
    io.to(`project:${req.project._id}`).emit('secret:deleted', { _id: req.params.secretId, key });

    res.json({ message: 'Secret deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.importSecrets = async (req, res) => {
  try {
    const { secrets } = req.body;
    if (!Array.isArray(secrets)) return res.status(400).json({ message: 'secrets array required' });

    let created = 0;
    let skipped = 0;

    for (const { key, value } of secrets) {
      if (!key || value === undefined) continue;
      const upperKey = key.toUpperCase().trim();
      const exists = await Secret.findOne({ projectId: req.project._id, key: upperKey });
      if (exists) { skipped++; continue; }
      const { encryptedValue, iv } = encrypt(String(value));
      await Secret.create({ projectId: req.project._id, key: upperKey, encryptedValue, iv, createdBy: req.user._id, updatedBy: req.user._id });
      created++;
    }

    await log({ projectId: req.project._id, userId: req.user._id, action: 'import', meta: { created, skipped } });

    res.json({ created, skipped });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportSecrets = async (req, res) => {
  try {
    const secrets = await Secret.find({ projectId: req.project._id }).sort({ key: 1 });
    const lines = secrets.map((s) => {
      const value = decrypt(s.encryptedValue, s.iv);
      return `${s.key}=${value}`;
    });

    await log({ projectId: req.project._id, userId: req.user._id, action: 'export' });

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="${req.project.name}.env"`);
    res.send(lines.join('\n'));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
