import mongoose from 'mongoose';

const incidentHistorySchema = new mongoose.Schema(
  {
    incident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'REPORTED',
        'ACKNOWLEDGED',
        'ASSIGNED',
        'STATUS_CHANGE',
        'VERIFIED',
        'RESOLVED',
        'REJECTED',
        'UPDATED'
      ]
    },
    previousStatus: {
      type: String,
      default: ''
    },
    newStatus: {
      type: String,
      default: ''
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    actorName: {
      type: String,
      required: true
    },
    actorRole: {
      type: String,
      required: true,
      enum: ['citizen', 'crew', 'admin', 'system']
    },
    notes: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

incidentHistorySchema.index({ incident: 1, timestamp: -1 });

const IncidentHistory = mongoose.model('IncidentHistory', incidentHistorySchema);
export default IncidentHistory;
