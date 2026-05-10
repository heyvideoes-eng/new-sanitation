import { db } from '../db/setup';

export const getFacilityHealthSummary = (facilityId: number) => {
  const latestStatus = db.prepare(`
    SELECT status, reason, updated_at 
    FROM cleanliness_status 
    WHERE facility_id = ? 
    ORDER BY id DESC LIMIT 1
  `).get(facilityId) as any;

  const latestQueue = db.prepare(`
    SELECT current_users, wait_time_mins, pressure_level 
    FROM crowd_queue 
    WHERE facility_id = ? 
    ORDER BY id DESC LIMIT 1
  `).get(facilityId) as any;

  const latestReading = db.prepare(`
    SELECT ammonia_level, tissue_level, soap_level 
    FROM sensor_readings 
    WHERE facility_id = ? 
    ORDER BY id DESC LIMIT 1
  `).get(facilityId) as any;

  const lastCleaning = db.prepare(`
    SELECT completed_at 
    FROM maintenance_tasks 
    WHERE facility_id = ? AND completed_at IS NOT NULL 
    ORDER BY completed_at DESC LIMIT 1
  `).get(facilityId) as any;

  const openAlerts = db.prepare(`
    SELECT COUNT(*) as count 
    FROM maintenance_tasks 
    WHERE facility_id = ? AND completed_at IS NULL
  `).get(facilityId) as any;

  // Compute Cleanliness Score (0-100)
  let score = 100;
  if (latestReading) {
    score -= (latestReading.ammonia_level / 100) * 40; // Ammonia affects 40%
    score -= (100 - latestReading.tissue_level) * 0.3; // Tissue affects 30%
    score -= (100 - latestReading.soap_level) * 0.3;   // Soap affects 30%
  }
  score = Math.max(0, Math.min(100, score));

  const lastCleanedAt = lastCleaning?.completed_at;
  const timeSinceLastClean = lastCleanedAt 
    ? Math.floor((Date.now() - new Date(lastCleanedAt).getTime()) / 60000)
    : 1440; // Default to 24 hours if never cleaned

  return {
    facility_id: facilityId,
    cleanliness_score: Math.round(score),
    occupancy_rate: latestQueue ? latestQueue.current_users / 20 : 0, // Assuming 20 is max capacity for scale
    queue_pressure: latestQueue?.pressure_level || 'LOW',
    last_cleaned_at: lastCleanedAt,
    time_since_last_clean_minutes: timeSinceLastClean,
    alerts_open_count: openAlerts.count,
    sla_breach_risk: (timeSinceLastClean > 120 && latestQueue?.pressure_level === 'HIGH') ? 'RED' : (timeSinceLastClean > 90 ? 'AMBER' : 'NONE')
  };
};

export const getGlobalKPIs = () => {
  const totalFacilities = db.prepare('SELECT COUNT(*) as count FROM facilities').get() as any;
  const openAlerts = db.prepare("SELECT COUNT(*) as count FROM maintenance_tasks WHERE status != 'COMPLETED'").get() as any;
  const tasksInProgress = db.prepare("SELECT COUNT(*) as count FROM maintenance_tasks WHERE status = 'IN_PROGRESS' OR status = 'ASSIGNED'").get() as any;
  
  const avgResponse = db.prepare(`
    SELECT AVG(response_time_mins) as avg 
    FROM budget_log 
    WHERE date(logged_at) = date('now')
  `).get() as any;

  const totalCost = db.prepare(`
    SELECT SUM(total_cost) as sum 
    FROM budget_log 
    WHERE date(logged_at) = date('now')
  `).get() as any;

  const totalUsers = db.prepare(`
    SELECT SUM(current_users) as sum 
    FROM crowd_queue 
    WHERE datetime(timestamp) >= datetime('now', '-24 hours')
  `).get() as any;

  return {
    total_facilities: totalFacilities.count,
    open_alerts: openAlerts.count,
    tasks_in_progress: tasksInProgress.count,
    avg_response_time_mins_today: Math.round((avgResponse.avg || 0) * 10) / 10,
    today_cost_inr: totalCost.sum || 0,
    total_users_last_24h: totalUsers.sum || 0,
    overall_cleanliness_index: 85 // Mock aggregate for now
  };
};
