import { Facility, User, MaintenanceTask } from './mongo.js';
import bcrypt from 'bcryptjs';

export const seedMongo = async () => {
  try {
    // 1. Clear existing
    await Facility.deleteMany({});
    await User.deleteMany({});
    await MaintenanceTask.deleteMany({});

    console.log('🗑️ [MongoDB] Cleared existing data');

    // 2. Seed Facilities
    const dehradunFacilities = [
      {
        name: 'SBM Toilet – Old Cantt Market',
        location: 'Old Cantt Market',
        address: 'Old Cantt Market, Quarter Deck Rd, Bharuwala Colony, Clement Town, Uttarakhand 248002',
        type: 'public',
        total_stalls: 10,
        coordinates: { lat: 30.2684, lng: 78.0068 },
        rating: 1.0,
        review_count: 1,
        status: 'OPEN',
        hours: 'Open · Closes 12 am',
        source_tag: 'SBM / Field survey'
      },
      {
        name: 'SBM Toilet – Quarter Deck Market',
        location: 'Quarter Deck Market',
        address: 'Quarter Deck Market, Bharuwala Colony, Clement Town, Uttarakhand 248002',
        type: 'public',
        total_stalls: 8,
        coordinates: { lat: 30.2695, lng: 78.0080 },
        rating: 4.0,
        review_count: 3,
        status: 'OPEN',
        hours: 'Open · Closes 11 pm',
        source_tag: 'SBM / Field survey'
      },
      {
        name: 'Public Toilet – ISBT Dehradun',
        location: 'ISBT',
        address: 'ISBT, Dehradun, Uttarakhand 248001',
        type: 'transport',
        total_stalls: 25,
        coordinates: { lat: 30.2847, lng: 77.9995 },
        rating: 3.4,
        review_count: 8,
        status: 'OPEN',
        hours: 'Open 24 hours',
        source_tag: 'SBM / Field survey'
      },
      {
        name: 'GEU Wash Room – B-Block',
        location: 'Graphic Era University',
        address: 'B-Block, GEU, Dehradun, Uttarakhand 248002',
        type: 'institutional',
        total_stalls: 12,
        coordinates: { lat: 30.2690, lng: 78.0010 },
        rating: null,
        review_count: 0,
        status: 'OPEN',
        hours: 'Open · Closes 8 pm',
        source_tag: 'Campus / Verified'
      }
    ];

    const insertedFacilities = await Facility.insertMany(dehradunFacilities);
    console.log(`✅ [MongoDB] Seeded ${insertedFacilities.length} facilities`);

    // 3. Seed Admin User
    const adminHash = await bcrypt.hash('Admin@123', 10);
    await User.create({
      username: 'admin@saaf.local',
      password_hash: adminHash,
      name: 'System Administrator',
      role: 'admin'
    });
    console.log('✅ [MongoDB] Seeded Admin User');

    // 4. Seed a few active tasks
    await MaintenanceTask.create({
      facility_id: insertedFacilities[0]._id,
      issue_reason: 'Ammonia Spike Detected (0.85 ppm)',
      description: 'Sensor reading exceeds safety threshold in Stall 4.',
      priority: 'CRITICAL',
      status: 'PENDING'
    });

    console.log('✅ [MongoDB] Seeded Initial Tasks');

  } catch (err) {
    console.error('❌ [MongoDB] Seeding error:', err);
  }
};
