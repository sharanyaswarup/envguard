const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, enum: ['create', 'update', 'delete', 'view', 'import', 'export', 'member_added', 'member_removed', 'member_updated'], required: true },
  targetKey: { type: String },
  meta: { type: Object, default: {} },
}, { timestamps: true });

auditLogSchema.index({ projectId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
