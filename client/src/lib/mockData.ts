import type { FacilityData } from '../components/UI/FacilityCard';

export const MOCK_FACILITIES: FacilityData[] = [
  {
    id: 1,
    name: 'SBM Toilet – Old Cantt Market',
    location: 'Old Cantt Market',
    address: 'Quarter Deck Rd, Bharuwala Colony, Clement Town, Uttarakhand 248002',
    type: 'public',
    total_stalls: 12,
    lat: 30.2705,
    lng: 78.0055,
    rating: 4.5,
    review_count: 12,
    current_status: 'GREEN',
    hours: 'Open · Closes 12 am',
    ward_number: 'Ward 18',
    zone: 'Clement Town',
    owning_agency: 'Cantonment Board',
    contractor_name: 'CleanCity Pvt Ltd',
    compliance_score: 98,
    health: { ammonia: 12, humidity: 45, last_reading: new Date().toISOString() },
    occupancy: 3,
    wait_time: 1
  },
  {
    id: 2,
    name: 'SBM Toilet – ISBT Flyover',
    location: 'ISBT Flyover',
    address: '22, ISBT Flyover, near ISBT Flyover, ISBT, Morowala, Subhash Nagar, Shewala Kala, Uttarakhand 248171',
    type: 'transport',
    total_stalls: 24,
    lat: 30.2850,
    lng: 77.9980,
    rating: 4.0,
    review_count: 32,
    current_status: 'AMBER',
    hours: 'Open 24 hours',
    ward_number: 'Ward 12',
    zone: 'Transport Corridor',
    owning_agency: 'Nagar Nigam Dehradun',
    contractor_name: 'EcoSan Solutions',
    compliance_score: 92,
    health: { ammonia: 28, humidity: 62, last_reading: new Date().toISOString() },
    occupancy: 18,
    wait_time: 8
  },
  {
    id: 3,
    name: 'SBM Toilet – Highway Corridor',
    location: 'Near ISBT',
    address: 'Ambala–Dehradun–Rishikesh Rd, near ISBT, Morowala, Majra, Dehradun, Uttarakhand 248002',
    type: 'transport',
    total_stalls: 32,
    lat: 30.2860,
    lng: 77.9970,
    rating: 3.4,
    review_count: 45,
    current_status: 'GREEN',
    hours: 'Open 24 hours',
    ward_number: 'Ward 12',
    zone: 'Transport Corridor',
    owning_agency: 'Nagar Nigam Dehradun',
    contractor_name: 'EcoSan Solutions',
    compliance_score: 88,
    health: { ammonia: 15, humidity: 40, last_reading: new Date().toISOString() },
    occupancy: 12,
    wait_time: 2
  },
  {
    id: 4,
    name: 'SBM Toilet – Quarter Deck Market',
    location: 'Quarter Deck Market',
    address: 'Market, Quarter Deck Rd, New Cantt, Bharuwala Colony, Clement Town, Dehradun, Uttarakhand 248002',
    type: 'public',
    total_stalls: 8,
    lat: 30.2710,
    lng: 78.0060,
    rating: 3.8,
    review_count: 5,
    current_status: 'RED',
    hours: 'Open · Closes 12 am',
    ward_number: 'Ward 18',
    zone: 'Clement Town',
    owning_agency: 'Cantonment Board',
    contractor_name: 'CleanCity Pvt Ltd',
    compliance_score: 75,
    health: { ammonia: 55, humidity: 75, last_reading: new Date().toISOString() },
    occupancy: 7,
    wait_time: 15
  }
];

export const MOCK_STATS = {
  total_facilities: 4,
  open_alerts: 1,
  tasks_in_progress: 3,
  avg_response_time_mins_today: 12,
  today_cost_inr: 4500,
  total_users_last_24h: 840,
  overall_cleanliness_index: 88
};

export const MOCK_BUDGET = {
  total_spent: 125400,
  total_tasks: 245,
  avg_cost_per_task: 512
};

export const MOCK_ALERTS = [
  {
    id: 1,
    facility_id: 4,
    facility_name: 'Quarter Deck Market',
    task_type: 'Cleaning Required',
    priority: 'HIGH',
    description: 'Ammonia levels exceeding 50ppm. Auto-dispatching unit.',
    created_at: new Date().toISOString(),
    completed_at: null
  },
  {
    id: 2,
    facility_id: 2,
    facility_name: 'ISBT Flyover',
    task_type: 'Supply Refill',
    priority: 'MEDIUM',
    description: 'Tissue paper levels low in stall 4.',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    completed_at: null
  }
];
