import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FacilityData } from '../components/UI/FacilityCard';
import { useSocket } from './SocketContext';
import { MOCK_FACILITIES, MOCK_STATS, MOCK_BUDGET, MOCK_ALERTS } from '../lib/mockData';
import { API_URL } from '../lib/api';

interface GlobalStats {
  total_facilities: number;
  open_alerts: number;
  tasks_in_progress: number;
  avg_response_time_mins_today: number;
  today_cost_inr: number;
  total_users_last_24h: number;
  overall_cleanliness_index: number;
}

interface AlertEvent {
  id: number;
  facility_id: number;
  facility_name: string;
  task_type: string;
  priority: string;
  description: string;
  created_at: string;
  completed_at: string | null;
  photo?: string;
  coords?: any;
}

interface BudgetSummary {
  total_spent: number;
  total_tasks: number;
  avg_cost_per_task: number;
}

interface PerformanceMetric {
  ward_number?: string;
  contractor_name?: string;
  toilet_count?: number;
  managed_facilities?: number;
  avg_compliance: number;
  avg_rating: number;
  total_complaints?: number;
  tasks_done?: number;
}

interface LiveDataContextType {
  facilities: FacilityData[];
  isLive: boolean;
  lastUpdated: Date;
  globalStats: GlobalStats | null;
  alerts: AlertEvent[];
  govtMode: boolean;
  setGovtMode: (val: boolean) => void;
  fetchInitial: () => Promise<void>;
  budgetSummary: BudgetSummary | null;
  wardPerformance: PerformanceMetric[];
  contractorPerformance: PerformanceMetric[];
  recommendation: { best: FacilityData | null; alternatives: FacilityData[] };
  submitInspection: (data: any) => Promise<any>;
  uploadPhoto: (formData: FormData) => Promise<any>;
}

const LiveDataContext = createContext<LiveDataContextType | undefined>(undefined);

export const LiveDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isConnected: isLive, socket } = useSocket();
  const [facilities, setFacilities] = useState<FacilityData[]>([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [alerts, setAlerts] = useState<AlertEvent[]>([]);
  const [govtMode, setGovtMode] = useState(false);
  
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [wardPerformance, setWardPerformance] = useState<PerformanceMetric[]>([]);
  const [contractorPerformance, setContractorPerformance] = useState<PerformanceMetric[]>([]);
  const [recommendation, setRecommendation] = useState<{ best: FacilityData | null; alternatives: FacilityData[] }>({ best: null, alternatives: [] });

  const fetchInitial = useCallback(async () => {
    try {
      const token = localStorage.getItem('saaf_token');
      const authHeader: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Basic Data
      const [facRes, recRes] = await Promise.all([
        fetch(`${API_URL}/api/facilities`).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/facilities/recommendation`).catch(() => ({ ok: false }))
      ]);
      
      if (facRes.ok) {
        setFacilities(await (facRes as Response).json());
      } else {
        setFacilities(MOCK_FACILITIES);
      }

      if (recRes.ok) {
        setRecommendation(await (recRes as Response).json());
      } else {
        setRecommendation({ best: MOCK_FACILITIES[0], alternatives: MOCK_FACILITIES.slice(1) });
      }

      // Dashboard & Performance Data
      const [dashRes, alertsRes, budgetRes, wardRes, contractRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/dashboard`, { headers: authHeader }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/dashboard/alerts-stream`, { headers: authHeader }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/budget/summary`, { headers: authHeader }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/analytics/wards/performance`, { headers: authHeader }).catch(() => ({ ok: false })),
        fetch(`${API_URL}/api/analytics/contracts/performance`, { headers: authHeader }).catch(() => ({ ok: false }))
      ]);

      if (dashRes.ok) setGlobalStats(await (dashRes as Response).json());
      else setGlobalStats(MOCK_STATS);

      if (alertsRes.ok) setAlerts(await (alertsRes as Response).json());
      else setAlerts(MOCK_ALERTS as any);

      if (budgetRes.ok) setBudgetSummary(await (budgetRes as Response).json());
      else setBudgetSummary(MOCK_BUDGET);

      if (wardRes.ok) setWardPerformance(await (wardRes as Response).json());
      if (contractRes.ok) setContractorPerformance(await (contractRes as Response).json());

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch initial state, falling back to mocks:', e);
      setFacilities(MOCK_FACILITIES);
      setGlobalStats(MOCK_STATS);
      setAlerts(MOCK_ALERTS as any);
      setBudgetSummary(MOCK_BUDGET);
      setRecommendation({ best: MOCK_FACILITIES[0], alternatives: MOCK_FACILITIES.slice(1) });
    }
  }, []);

  const submitInspection = async (data: any) => {
    const res = await fetch(`${API_URL}/api/inspections/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    fetchInitial(); // Refresh
    return result;
  };

  const uploadPhoto = async (formData: FormData) => {
    const res = await fetch(`${API_URL}/api/photos/upload`, {
      method: 'POST',
      body: formData
    });
    return await res.json();
  };

  useEffect(() => {
    fetchInitial();

    socket.on('connect', () => {
      fetchInitial();
    });

    socket.on('sensor_update', (update: any) => {
      setFacilities(prev => prev.map(f => 
        f.id === update.facility_id ? { 
          ...f, 
          health: { ...f.health, ammonia: update.ammonia, humidity: update.humidity, last_reading: new Date().toISOString() } 
        } : f
      ));
      setLastUpdated(new Date());
    });

    socket.on('status_change', (update: any) => {
      setFacilities(prev => prev.map(f => f.id === update.facility_id ? { ...f, current_status: update.new_status } : f));
      setLastUpdated(new Date());
      fetchInitial();
    });

    socket.on('queue_update', (update: any) => {
      setFacilities(prev => prev.map(f => f.id === update.facility_id ? { ...f, occupancy: update.current_users, wait_time: update.wait_time } : f));
      setLastUpdated(new Date());
    });

    socket.on('maintenance_alert', (alert: any) => {
      setAlerts(prev => [alert, ...prev].slice(0, 20));
      setLastUpdated(new Date());
    });

    socket.on('maintenance_update', (update: any) => {
      setAlerts(prev => prev.map(a => a.id === update.task_id ? { ...a, status: update.status, completed_at: update.completed_at, photo: update.photo, coords: update.coords } : a));
      if (update.status === 'COMPLETED') {
        setFacilities(prev => prev.map(f => f.id === update.facility_id ? { ...f, status: 'OPEN' } : f));
      }
      setLastUpdated(new Date());
    });

    // --- SIMULATION FALLBACK FOR VERCEL/DEMO ---
    // If the socket isn't connected (common on Vercel), we simulate data so the UI isn't dead.
    let simulationInterval: any;
    if (!isLive) {
      simulationInterval = setInterval(() => {
        setFacilities(prev => prev.map(f => {
          if (Math.random() > 0.7) {
            return {
              ...f,
              health: {
                ...f.health,
                ammonia: Math.max(0, Math.min(100, (f.health?.ammonia || 0) + (Math.random() * 4 - 2))),
                humidity: Math.max(0, Math.min(100, (f.health?.humidity || 0) + (Math.random() * 4 - 2))),
                last_reading: new Date().toISOString()
              }
            };
          }
          return f;
        }));
        setLastUpdated(new Date());
      }, 5000);
    }

    return () => {
      socket.off('connect');
      socket.off('sensor_update');
      socket.off('status_change');
      socket.off('queue_update');
      socket.off('maintenance_alert');
      socket.off('maintenance_update');
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, [fetchInitial, socket, isLive]);

  return (
    <LiveDataContext.Provider value={{ 
      facilities, isLive, lastUpdated, globalStats, alerts, govtMode, setGovtMode, fetchInitial,
      budgetSummary, wardPerformance, contractorPerformance, recommendation,
      submitInspection, uploadPhoto
    }}>
      {children}
    </LiveDataContext.Provider>
  );
};

export const useLiveData = () => {
  const context = useContext(LiveDataContext);
  if (!context) throw new Error('useLiveData must be used within LiveDataProvider');
  return context;
};
