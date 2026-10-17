import bcrypt from 'bcryptjs';
import {
  UserModel,
  IncidentModel,
  IncidentHistoryModel,
  NotificationModel,
  saveLocalData
} from '../config/datastore.js';
import { logger } from '../utils/logger.js';

export async function seedInitialData(force = false) {
  const User = UserModel();
  const Incident = IncidentModel();
  const IncidentHistory = IncidentHistoryModel();
  const Notification = NotificationModel();

  const userCount = await User.countDocuments({});
  if (userCount > 0 && !force) {
    logger.info('Database already contains records. Skipping seed step.');
    return;
  }

  logger.info('🌱 Seeding CivicShield demonstration accounts and simulated incidents...');

  // 1. Create Demo Users
  const citizen = await User.create({
    name: 'Sarah Jenkins (Citizen)',
    email: 'citizen@civicshield.gov',
    password: 'demo123',
    role: 'citizen'
  });

  const crew1 = await User.create({
    name: 'Carlos Rivera (Electrical Safety)',
    email: 'crew@civicshield.gov',
    password: 'demo123',
    role: 'crew',
    crewDetails: {
      department: 'Electrical Safety & Grid Ops',
      vehicleId: 'TRUCK-E1',
      phone: '555-0144',
      isAvailable: true
    }
  });

  const crew2 = await User.create({
    name: 'Marcus Thorne (Roads & Water)',
    email: 'crew2@civicshield.gov',
    password: 'demo123',
    role: 'crew',
    crewDetails: {
      department: 'Roads, Asphalt & Drainage',
      vehicleId: 'UNIT-R4',
      phone: '555-0188',
      isAvailable: true
    }
  });

  const admin = await User.create({
    name: 'Director Elena Vance (Municipal Ops)',
    email: 'admin@civicshield.gov',
    password: 'demo123',
    role: 'admin'
  });

  // 2. Demonstration Incidents (Simulated municipal hazard data)
  const incidentsData = [
    {
      incidentId: 'CS-2026-1001',
      title: 'Live High-Voltage Cable Hanging Over School Crosswalk',
      category: 'Electrical Hazard',
      description: 'Severe storm damaged wooden utility pole causing overhead primary conductor to break and sag ~5 feet above pedestrian crosswalk. Active arcing observed when wind gusts blow cable against metal fence.',
      urgency: 'Critical',
      address: '742 Evergreen Terrace, near Lincoln Elementary',
      landmark: 'Crosswalk opposite Elm Street Gate',
      location: { type: 'Point', coordinates: [-122.4188, 37.7752] },
      photos: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      status: 'Reported',
      createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 mins ago
    },
    {
      incidentId: 'CS-2026-1002',
      title: 'Uncovered Deep Stormwater Drain Manhole Near Transit Hub',
      category: 'Open Manhole',
      description: 'Heavy iron circular manhole cover missing following street sweeping operations. Over 8 feet deep pit is currently unbarricaded in a high-density commuter footway.',
      urgency: 'Critical',
      address: 'Market St & 5th Avenue Transit Plaza',
      landmark: 'Immediately adjacent to Subway North Entrance',
      location: { type: 'Point', coordinates: [-122.4172, 37.7765] },
      photos: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      assignedCrew: crew2._id,
      status: 'In Progress',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3h ago
    },
    {
      incidentId: 'CS-2026-1003',
      title: 'Major Water Main Pipe Fracture Flooding Intersection',
      category: 'Water Leakage',
      description: 'Pressurized municipal supply line rupture is discharging thousands of gallons onto roadway. Pavement buckling and visible erosion of sub-base under the east lane.',
      urgency: 'Medium',
      address: '1200 Mission Boulevard',
      landmark: 'In front of Central Public Library',
      location: { type: 'Point', coordinates: [-122.4215, 37.7735] },
      photos: ['https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      assignedCrew: crew2._id,
      status: 'Assigned',
      createdAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
    },
    {
      incidentId: 'CS-2026-1004',
      title: 'Dangerous 2-Foot Asphalt Pothole Damaging Vehicle Suspensions',
      category: 'Road Damage',
      description: 'Consecutive freeze-thaw cycles created an aggressive crater across northbound lane. Multiple cyclists and motor vehicles reported tire ruptures.',
      urgency: 'Medium',
      address: '350 Bay Street, Northbound Lane',
      landmark: 'Near Pier 39 intersection',
      location: { type: 'Point', coordinates: [-122.4160, 37.7780] },
      photos: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      status: 'Acknowledged',
      createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
    },
    {
      incidentId: 'CS-2026-1005',
      title: 'Street Grate Sewage Seepage and Odor Concern',
      category: 'Sewage Overflow',
      description: 'Foul-smelling effluent bubbling up from underground collector chamber during heavy shower. Runoff approaching neighborhood stormwater drain.',
      urgency: 'Low',
      address: '88 Valencia Way',
      landmark: 'Next to Valencia Community Garden',
      location: { type: 'Point', coordinates: [-122.4230, 37.7720] },
      photos: ['https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      status: 'Reported',
      createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
    },
    {
      incidentId: 'CS-2026-1006',
      title: 'Sparking Transformer Fuse on Utility Pole',
      category: 'Electrical Hazard',
      description: 'Loud popping and electrical discharge on pole-mounted 25kVA transformer unit.',
      urgency: 'Critical',
      address: '410 Castro Street',
      landmark: 'Corner of 17th St',
      location: { type: 'Point', coordinates: [-122.4350, 37.7600] },
      photos: ['https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&w=800&q=80'],
      reporter: citizen._id,
      reporterName: citizen.name,
      assignedCrew: crew1._id,
      status: 'Resolved',
      verification: {
        verifiedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        verifiedBy: crew1._id,
        notes: 'Inspected pole #EL-490. Primary fuse cutout porcelain insulator was cracked.',
        confirmedHazardLevel: 'Critical',
        onSitePhotos: []
      },
      resolution: {
        resolvedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        resolvedBy: crew1._id,
        notes: 'De-energized line segment. Replaced defective 25kVA fuse cutout with heavy-duty polymer unit. Re-tested phase continuity and restored service. Area verified safe for pedestrian traffic.',
        resolutionPhotos: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80']
      },
      createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      incidentId: 'CS-2026-1007',
      title: 'Private Residential Driveway Paver Settling',
      category: 'Other',
      description: 'Driveway bricks sunk 2 inches inside private garage approach.',
      urgency: 'Low',
      address: '221B Baker Street',
      landmark: 'Private Garage',
      location: { type: 'Point', coordinates: [-122.4400, 37.7700] },
      photos: [],
      reporter: citizen._id,
      reporterName: citizen.name,
      status: 'Rejected',
      rejectionReason: 'Private property defect outside municipal public right-of-way jurisdiction. Homeowner referred to private contractors.',
      createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString()
    }
  ];

  for (const incData of incidentsData) {
    const inc = await Incident.create(incData);

    // Initial reported audit
    await IncidentHistory.create({
      incident: inc._id,
      action: 'REPORTED',
      previousStatus: '',
      newStatus: 'Reported',
      actor: citizen._id,
      actorName: citizen.name,
      actorRole: 'citizen',
      notes: 'Initial hazard logged with coordinates and evidence.'
    });

    if (inc.status === 'In Progress' || inc.status === 'Assigned') {
      await IncidentHistory.create({
        incident: inc._id,
        action: 'ASSIGNED',
        previousStatus: 'Reported',
        newStatus: 'Assigned',
        actor: admin._id,
        actorName: admin.name,
        actorRole: 'admin',
        notes: `Assigned to specialized field crew.`
      });
    }

    if (inc.status === 'In Progress') {
      await IncidentHistory.create({
        incident: inc._id,
        action: 'STATUS_CHANGE',
        previousStatus: 'Assigned',
        newStatus: 'In Progress',
        actor: crew2._id,
        actorName: crew2.name,
        actorRole: 'crew',
        notes: 'Crew mobilized on-site with emergency response equipment.'
      });
    }

    if (inc.status === 'Resolved') {
      await IncidentHistory.create({
        incident: inc._id,
        action: 'VERIFIED',
        previousStatus: 'In Progress',
        newStatus: 'Verified',
        actor: crew1._id,
        actorName: crew1.name,
        actorRole: 'crew',
        notes: inc.verification.notes
      });
      await IncidentHistory.create({
        incident: inc._id,
        action: 'RESOLVED',
        previousStatus: 'Verified',
        newStatus: 'Resolved',
        actor: crew1._id,
        actorName: crew1.name,
        actorRole: 'crew',
        notes: inc.resolution.notes
      });
    }

    if (inc.status === 'Rejected') {
      await IncidentHistory.create({
        incident: inc._id,
        action: 'REJECTED',
        previousStatus: 'Reported',
        newStatus: 'Rejected',
        actor: admin._id,
        actorName: admin.name,
        actorRole: 'admin',
        notes: `Rejection notice: ${inc.rejectionReason}`
      });
    }
  }

  // 3. Create Sample In-App Notifications
  await Notification.create({
    recipient: citizen._id,
    title: 'Report Acknowledged',
    message: 'Your report CS-2026-1002 for Uncovered Deep Stormwater Drain has been dispatched to field crews.',
    type: 'STATUS_CHANGE'
  });

  await Notification.create({
    recipient: crew1._id,
    title: 'Resolution Confirmed',
    message: 'Incident CS-2026-1006 has been archived as resolved. SLA met in 4.2h.',
    type: 'RESOLUTION'
  });

  await Notification.create({
    recipient: admin._id,
    title: 'Critical Hazard Alert',
    message: 'Immediate priority: CS-2026-1001 Live High-Voltage Cable requires crew assignment.',
    type: 'ALERT'
  });

  saveLocalData();
  logger.info('✅ Successfully seeded demonstration accounts and simulated incidents.');
}

// Allow direct CLI execution: node seed/seedData.js
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  seedInitialData(true).then(() => {
    logger.info('Seed execution finished.');
    process.exit(0);
  }).catch((err) => {
    logger.error('Seed execution error:', err);
    process.exit(1);
  });
}
