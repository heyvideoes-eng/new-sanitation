import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { FacilityData } from '../components/UI/FacilityCard';
import { useSocket } from './SocketContext';

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

  const getApiURL = useCallback(() => {
    if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api') {
      return import.meta.env.VITE_API_URL;
    }
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = window.location.port;
    if (import.meta.env.VITE_API_URL === '/api') return '';
    if (hostname === 'localhost' || hostname === '127.0.0.1') return `http://${hostname}:4000`;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }, []);

  const fetchInitial = useCallback(async () => {
    try {
      const API_URL = getApiURL();
      const token = localStorage.getItem('saaf_token');
      const authHeader = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      // Basic Data
      const [facRes, recRes] = await Promise.all([
        fetch(`${API_URL}/api/facilities`),
        fetch(`${API_URL}/api/facilities/recommendation`)
      ]);
      
      if (facRes.ok) setFacilities(await facRes.json());
      if (recRes.ok) setRecommendation(await recRes.json());

      // Dashboard & Performance Data
      const [dashRes, alertsRes, budgetRes, wardRes, contractRes] = await Promise.all([
        fetch(`${API_URL}/api/analytics/dashboard`, { headers: authHeader }),
        fetch(`${API_URL}/api/dashboard/alerts-stream`, { headers: authHeader }),
        fetch(`${API_URL}/api/budget/summary`, { headers: authHeader }),
        fetch(`${API_URL}/api/analytics/wards/performance`, { headers: authHeader }),
        fetch(`${API_URL}/api/analytics/contracts/performance`, { headers: authHeader })
      ]);

      if (dashRes.ok) setGlobalStats(await dashRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());
      if (budgetRes.ok) setBudgetSummary(await budgetRes.json());
      if (wardRes.ok) setWardPerformance(await wardRes.json());
      if (contractRes.ok) setContractorPerformance(await contractRes.json());

      setLastUpdated(new Date());
    } catch (e) {
      console.error('Failed to fetch initial state:', e);
    }
  }, [getApiURL]);

  const submitInspection = async (data: any) => {
    const API_URL = getApiURL();
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
    const API_URL = getApiURL();
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

    return () => {
      socket.off('connect');
      socket.off('sensor_update');
      socket.off('status_change');
      socket.off('queue_update');
      socket.off('maintenance_alert');
      socket.off('maintenance_update');
    };
  }, [fetchInitial, socket]);

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
