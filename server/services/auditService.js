const AuditLog = require('../models/AuditLog');

const log = async ({ projectId, userId, action, targetKey, meta = {} }) => {
  try {
    await AuditLog.create({ projectId, userId, action, targetKey, meta });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = { log };
