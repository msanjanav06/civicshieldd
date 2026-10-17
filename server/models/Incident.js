import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    incidentId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Incident title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Hazard category is required'],
      enum: [
        'Electrical Hazard',
        'Water Leakage',
        'Open Manhole',
        'Road Damage',
        'Sewage Overflow',
        'Other'
      ],
      index: true
    },
    description: {
      type: String,
      required: [true, 'Incident description is required'],
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    urgency: {
      type: String,
      required: true,
      enum: ['Low', 'Medium', 'Critical'],
      default: 'Medium',
      index: true
    },
    address: {
      type: String,
      required: [true, 'Location address is required'],
      trim: true
    },
    landmark: {
      type: String,
      trim: true,
      default: ''
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      // GeoJSON standard: [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Valid latitude and longitude coordinates are required'],
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 &&
              val[1] >= -90 &&
              val[1] <= 90
            );
          },
          message: 'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]'
        }
      }
    },
    photos: {
      type: [String],
      default: []
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    reporterName: {
      type: String,
      default: 'Anonymous Citizen'
    },
    reporterEmail: {
      type: String,
      default: '',
      select: false // Protected: citizen private email not exposed to public feed
    },
    assignedCrew: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    status: {
      type: String,
      enum: [
        'Reported',
        'Acknowledged',
        'Assigned',
        'In Progress',
        'Verified',
        'Resolved',
        'Rejected'
      ],
      default: 'Reported',
      index: true
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true
    },
    verification: {
      verifiedAt: { type: Date },
      verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String, default: '' },
      confirmedHazardLevel: { type: String, enum: ['Low', 'Medium', 'Critical', ''], default: '' },
      onSitePhotos: { type: [String], default: [] }
    },
    resolution: {
      resolvedAt: { type: Date },
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      notes: { type: String, default: '' },
      resolutionPhotos: { type: [String], default: [] }
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for high-precision geospatial queries & duplicate radius checks
incidentSchema.index({ location: '2dsphere' });
// Compound index for category and status filtering
incidentSchema.index({ category: 1, status: 1 });
incidentSchema.index({ urgency: 1, status: 1 });
incidentSchema.index({ createdAt: -1 });

const Incident = mongoose.model('Incident', incidentSchema);
export default Incident;
