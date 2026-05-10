import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/saaf_sanitation';

import { seedMongo } from './mongoSeed.js';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🍃 [MongoDB] Connected to SAAF Atlas');
    
    // Optional: Auto-seed for demo
    await seedMongo();
  } catch (err) {
    console.error('⚠️ [MongoDB] Connection failed. Running on SQLite fallback.');
  }
};

// --- Models ---

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String, required: true },
  address: String,
  type: { 
    type: String, 
    enum: ['men', 'women', 'unisex', 'accessible', 'public', 'institutional', 'commercial', 'transport'],
    required: true 
  },
  total_stalls: { type: Number, required: true },
  coordinates: {
    lat: Number,
    lng: Number
  },
  rating: { type: Number, default: null },
  review_count: { type: Number, default: 0 },
  status: { type: String, default: 'OPEN' },
  hours: String,
  source_tag: String
}, { timestamps: true });

export const Facility = mongoose.model('Facility', facilitySchema);

const maintenanceTaskSchema = new mongoose.Schema({
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  status: { 
    type: String, 
    enum: ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING'
  },
  priority: {
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM'
  },
  issue_reason: String,
  description: String,
  assigned_to: String,
  accepted_at: Date,
  eta_minutes: Number,
  completed_at: Date,
  cost_inr: Number,
  scan_qr_code: String,
  supplies_used: [String],
  issues_noted: String
}, { timestamps: true });

export const MaintenanceTask = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

const sensorReadingSchema = new mongoose.Schema({
  facility_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
  ammonia_level: Number,
  humidity: Number,
  floor_wet: { type: Boolean, default: false },
  flush_count: { type: Number, default: 0 },
  tissue_level: Number,
  soap_level: Number,
  timestamp: { type: Date, default: Date.now }
});

export const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String, required: true },
  name: String,
  role: { type: String, enum: ['admin', 'cleaner'], default: 'admin' },
  assigned_zone: String // For cleaners
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
