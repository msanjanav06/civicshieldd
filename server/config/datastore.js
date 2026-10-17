import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { calculateHaversineDistance } from '../utils/duplicateDetector.js';

let isLiveConnected = false;
const DATA_FILE = path.resolve('data/civicshield_db.json');

// Default initial state
const memoryDb = {
  users: [],
  incidents: [],
  incidentHistories: [],
  notifications: []
};

// Load saved data if file exists
function loadLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      memoryDb.users = parsed.users || [];
      memoryDb.incidents = parsed.incidents || [];
      memoryDb.incidentHistories = parsed.incidentHistories || [];
      memoryDb.notifications = parsed.notifications || [];
      logger.info(`Loaded ${memoryDb.incidents.length} incidents and ${memoryDb.users.length} users from local datastore cache.`);
    }
  } catch (err) {
    logger.warn('Failed to read local datastore cache, starting with clean memory store.', err.message);
  }
}

// Persist data to file asynchronously
export function saveLocalData() {
  if (isLiveConnected) return;
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    logger.error('Failed to persist datastore cache:', err);
  }
}

export function generateObjectId() {
  return crypto.randomBytes(12).toString('hex');
}

// Query helper for embedded store
function matchesQuery(item, query = {}) {
  for (const [key, val] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(val)) {
      const matched = val.some((subQ) => matchesQuery(item, subQ));
      if (!matched) return false;
      continue;
    }

    if (key === 'location' && val && val.$geoWithin && val.$geoWithin.$centerSphere) {
      const [[centerLng, centerLat], radiusInRadians] = val.$geoWithin.$centerSphere;
      const radiusMeters = radiusInRadians * 6378100;
      if (!item.location || !item.location.coordinates) return false;
      const [itemLng, itemLat] = item.location.coordinates;
      const dist = calculateHaversineDistance(centerLng, centerLat, itemLng, itemLat);
      if (dist > radiusMeters) return false;
      continue;
    }

    const itemVal = item[key];

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      if (val.$in && Array.isArray(val.$in)) {
        if (!val.$in.map(String).includes(String(itemVal))) return false;
      } else if (val.$ne !== undefined) {
        if (String(itemVal) === String(val.$ne)) return false;
      } else if (val.$gte !== undefined) {
        if (new Date(itemVal) < new Date(val.$gte)) return false;
      } else if (val.$lte !== undefined) {
        if (new Date(itemVal) > new Date(val.$lte)) return false;
      } else if (val.$regex) {
        const regex = new RegExp(val.$regex, val.$options || 'i');
        if (!regex.test(String(itemVal || ''))) return false;
      }
    } else if (val !== undefined) {
      if (String(itemVal) !== String(val)) return false;
    }
  }
  return true;
}

// Populate references
function populateRecord(record, collectionName) {
  if (!record) return null;
  const cloned = JSON.parse(JSON.stringify(record));

  if (collectionName === 'incidents') {
    if (cloned.reporter && typeof cloned.reporter === 'string') {
      const user = memoryDb.users.find((u) => u._id === cloned.reporter);
      if (user) {
        cloned.reporter = { _id: user._id, name: user.name, role: user.role };
      }
    }
    if (cloned.assignedCrew && typeof cloned.assignedCrew === 'string') {
      const crew = memoryDb.users.find((u) => u._id === cloned.assignedCrew);
      if (crew) {
        cloned.assignedCrew = {
          _id: crew._id,
          name: crew.name,
          role: crew.role,
          crewDetails: crew.crewDetails
        };
      }
    }
  } else if (collectionName === 'notifications') {
    if (cloned.incident && typeof cloned.incident === 'string') {
      const inc = memoryDb.incidents.find((i) => i._id === cloned.incident);
      if (inc) {
        cloned.incident = { _id: inc._id, incidentId: inc.incidentId, title: inc.title, status: inc.status };
      }
    }
  }

  return cloned;
}

// Unified Query Builder for embedded datastore
class QueryChain {
  constructor(collection, collectionName, query = {}) {
    this.collection = collection;
    this.collectionName = collectionName;
    this.query = query;
    this._sort = null;
    this._skip = 0;
    this._limit = 0;
    this._populateFields = [];
  }

  sort(sortObj) {
    this._sort = sortObj;
    return this;
  }

  skip(n) {
    this._skip = parseInt(n, 10) || 0;
    return this;
  }

  limit(n) {
    this._limit = parseInt(n, 10) || 0;
    return this;
  }

  populate(field, select) {
    this._populateFields.push(field);
    return this;
  }

  select() {
    return this;
  }

  lean() {
    return this;
  }

  async exec() {
    let results = this.collection.filter((item) => matchesQuery(item, this.query));

    if (this._sort) {
      const [field, direction] = Object.entries(this._sort)[0] || ['createdAt', -1];
      const dir = direction === -1 || direction === 'desc' ? -1 : 1;
      results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return -1 * dir;
        if (valA > valB) return 1 * dir;
        return 0;
      });
    }

    if (this._skip > 0) {
      results = results.slice(this._skip);
    }
    if (this._limit > 0) {
      results = results.slice(0, this._limit);
    }

    return results.map((r) => populateRecord(r, this.collectionName));
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }
}

// User model adapter
export const LocalUser = {
  async findOne(query) {
    let user = memoryDb.users.find((u) => matchesQuery(u, query));
    if (!user) return null;
    return attachUserMethods(JSON.parse(JSON.stringify(user)));
  },
  async findById(id) {
    return this.findOne({ _id: id });
  },
  async find(query = {}) {
    return new QueryChain(memoryDb.users, 'users', query);
  },
  async countDocuments(query = {}) {
    return memoryDb.users.filter((u) => matchesQuery(u, query)).length;
  },
  async create(data) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const newUser = {
      _id: generateObjectId(),
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      role: data.role || 'citizen',
      crewDetails: data.crewDetails || {
        department: 'General Infrastructure',
        vehicleId: '',
        phone: '',
        isAvailable: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    memoryDb.users.push(newUser);
    saveLocalData();
    return attachUserMethods(JSON.parse(JSON.stringify(newUser)));
  }
};

function attachUserMethods(userObj) {
  if (!userObj) return null;
  userObj.comparePassword = async function (candidatePassword) {
    // Find original user record with password
    const original = memoryDb.users.find((u) => u._id === this._id);
    if (!original || !original.password) return false;
    return bcrypt.compare(candidatePassword, original.password);
  };
  userObj.toJSON = function () {
    const copy = { ...this };
    delete copy.password;
    return copy;
  };
  userObj.save = async function () {
    const idx = memoryDb.users.findIndex((u) => u._id === this._id);
    if (idx !== -1) {
      memoryDb.users[idx] = { ...memoryDb.users[idx], ...this, updatedAt: new Date().toISOString() };
      saveLocalData();
    }
    return this;
  };
  return userObj;
}

// Incident model adapter
export const LocalIncident = {
  find(query = {}) {
    return new QueryChain(memoryDb.incidents, 'incidents', query);
  },
  async findOne(query) {
    const inc = memoryDb.incidents.find((i) => matchesQuery(i, query));
    if (!inc) return null;
    return attachIncidentMethods(populateRecord(inc, 'incidents'));
  },
  async findById(id) {
    return this.findOne({ _id: id });
  },
  async countDocuments(query = {}) {
    return memoryDb.incidents.filter((i) => matchesQuery(i, query)).length;
  },
  async create(data) {
    const now = new Date().toISOString();
    const newInc = {
      _id: generateObjectId(),
      incidentId: data.incidentId || `CS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      title: data.title,
      category: data.category,
      description: data.description,
      urgency: data.urgency || 'Medium',
      address: data.address,
      landmark: data.landmark || '',
      location: {
        type: 'Point',
        coordinates: [parseFloat(data.location.coordinates[0]), parseFloat(data.location.coordinates[1])]
      },
      photos: data.photos || [],
      reporter: data.reporter || null,
      reporterName: data.reporterName || 'Anonymous Citizen',
      assignedCrew: data.assignedCrew || null,
      status: data.status || 'Reported',
      rejectionReason: data.rejectionReason || '',
      verification: data.verification || {
        verifiedAt: null,
        verifiedBy: null,
        notes: '',
        confirmedHazardLevel: '',
        onSitePhotos: []
      },
      resolution: data.resolution || {
        resolvedAt: null,
        resolvedBy: null,
        notes: '',
        resolutionPhotos: []
      },
      createdAt: now,
      updatedAt: now
    };
    memoryDb.incidents.unshift(newInc);
    saveLocalData();
    return attachIncidentMethods(populateRecord(newInc, 'incidents'));
  }
};

function attachIncidentMethods(incidentObj) {
  if (!incidentObj) return null;
  incidentObj.save = async function () {
    const idx = memoryDb.incidents.findIndex((i) => i._id === this._id);
    if (idx !== -1) {
      memoryDb.incidents[idx] = {
        ...memoryDb.incidents[idx],
        ...this,
        updatedAt: new Date().toISOString()
      };
      saveLocalData();
    }
    return this;
  };
  return incidentObj;
}

// IncidentHistory model adapter
export const LocalIncidentHistory = {
  find(query = {}) {
    return new QueryChain(memoryDb.incidentHistories, 'incidentHistories', query);
  },
  async create(data) {
    const newHist = {
      _id: generateObjectId(),
      incident: data.incident,
      action: data.action,
      previousStatus: data.previousStatus || '',
      newStatus: data.newStatus || '',
      actor: data.actor,
      actorName: data.actorName,
      actorRole: data.actorRole,
      notes: data.notes || '',
      metadata: data.metadata || {},
      timestamp: new Date().toISOString()
    };
    memoryDb.incidentHistories.unshift(newHist);
    saveLocalData();
    return newHist;
  }
};

// Notification model adapter
export const LocalNotification = {
  find(query = {}) {
    return new QueryChain(memoryDb.notifications, 'notifications', query);
  },
  async findById(id) {
    const n = memoryDb.notifications.find((item) => item._id === id);
    if (!n) return null;
    return attachNotificationMethods(n);
  },
  async create(data) {
    const newNotif = {
      _id: generateObjectId(),
      recipient: data.recipient,
      incident: data.incident || null,
      title: data.title,
      message: data.message,
      type: data.type || 'STATUS_CHANGE',
      isRead: false,
      createdAt: new Date().toISOString()
    };
    memoryDb.notifications.unshift(newNotif);
    saveLocalData();
    return attachNotificationMethods(newNotif);
  }
};

function attachNotificationMethods(notifObj) {
  if (!notifObj) return null;
  notifObj.save = async function () {
    const idx = memoryDb.notifications.findIndex((n) => n._id === this._id);
    if (idx !== -1) {
      memoryDb.notifications[idx] = { ...memoryDb.notifications[idx], ...this };
      saveLocalData();
    }
    return this;
  };
  return notifObj;
}

export async function initDatastore() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicshield';
  try {
    logger.info(`Checking MongoDB connection at: ${uri}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 1500 });
    isLiveConnected = true;
    logger.info(`Connected to live MongoDB server: ${mongoose.connection.host}`);
  } catch (err) {
    isLiveConnected = false;
    logger.info(`Live MongoDB connection not available (${err.message}).`);
    logger.info('Activating CivicShield resilient zero-latency local datastore (Persisted at server/data/civicshield_db.json).');
    loadLocalData();
  }
}

export function getDbStatus() {
  return {
    isLiveMongo: isLiveConnected,
    mode: isLiveConnected ? 'Live MongoDB (Mongoose)' : 'Local File-Backed Datastore',
    userCount: memoryDb.users.length,
    incidentCount: memoryDb.incidents.length
  };
}

// Exports unified models
export const UserModel = () => (isLiveConnected ? mongoose.model('User') : LocalUser);
export const IncidentModel = () => (isLiveConnected ? mongoose.model('Incident') : LocalIncident);
export const IncidentHistoryModel = () => (isLiveConnected ? mongoose.model('IncidentHistory') : LocalIncidentHistory);
export const NotificationModel = () => (isLiveConnected ? mongoose.model('Notification') : LocalNotification);
export const getMemoryDb = () => memoryDb;
