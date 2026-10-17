import { IncidentModel } from '../config/datastore.js';

/**
 * Calculates distance in meters between two [longitude, latitude] coordinates
 * using the Haversine formula.
 */
export function calculateHaversineDistance(lon1, lat1, lon2, lat2) {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c); // Distance in meters
}

/**
 * Checks for unresolved incidents matching category, time window, and proximity.
 * @param {Object} params
 * @param {string} params.category - Incident hazard category
 * @param {number} params.latitude - Incident latitude
 * @param {number} params.longitude - Incident longitude
 * @param {number} [params.radiusMeters] - Configurable radius in meters (default 100)
 * @param {number} [params.hoursWindow] - Configurable time window in hours (default 72)
 * @param {string} [params.excludeIncidentId] - Exclude current incident (if editing)
 */
export async function checkForDuplicates({
  category,
  latitude,
  longitude,
  radiusMeters = parseInt(process.env.DUPLICATE_RADIUS_METERS || '100', 10),
  hoursWindow = parseInt(process.env.DUPLICATE_HOURS_WINDOW || '72', 10),
  excludeIncidentId = null
}) {
  const cutoffDate = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

  // Unresolved statuses
  const activeStatuses = ['Reported', 'Acknowledged', 'Assigned', 'In Progress', 'Verified'];

  // Convert meters to radians for MongoDB $centerSphere (Earth radius ~ 6,378,100m)
  const radiusInRadians = radiusMeters / 6378100;

  const query = {
    category,
    status: { $in: activeStatuses },
    createdAt: { $gte: cutoffDate },
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInRadians]
      }
    }
  };

  if (excludeIncidentId) {
    query._id = { $ne: excludeIncidentId };
  }

  const Incident = IncidentModel();
  const potentialMatches = await Incident.find(query)
    .select('incidentId title category address status urgency location createdAt photos')
    .sort({ createdAt: -1 })
    .lean();

  if (!potentialMatches || potentialMatches.length === 0) {
    return {
      hasDuplicate: false,
      duplicates: []
    };
  }

  // Calculate precise distance for each match
  const duplicatesWithDistance = potentialMatches
    .map((inc) => {
      if (!inc.location || !inc.location.coordinates) return null;
      const [incLng, incLat] = inc.location.coordinates;
      const distanceMeters = calculateHaversineDistance(longitude, latitude, incLng, incLat);
      return {
        _id: inc._id,
        incidentId: inc.incidentId,
        title: inc.title,
        category: inc.category,
        address: inc.address,
        status: inc.status,
        urgency: inc.urgency,
        photo: inc.photos && inc.photos.length > 0 ? inc.photos[0] : null,
        createdAt: inc.createdAt,
        distanceMeters
      };
    })
    .filter(Boolean)
    .filter((inc) => inc.distanceMeters <= radiusMeters);

  return {
    hasDuplicate: duplicatesWithDistance.length > 0,
    radiusMeters,
    hoursWindow,
    count: duplicatesWithDistance.length,
    duplicates: duplicatesWithDistance
  };
}
