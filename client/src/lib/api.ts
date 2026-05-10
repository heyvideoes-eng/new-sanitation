export const getApiURL = () => {
  // Priority 1: Environment Variable
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL !== '/api') {
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Relative /api path
  if (import.meta.env.VITE_API_URL === '/api') return '';

  const hostname = window.location.hostname;
  
  // Priority 3: Localhost dev
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:4000`;
  }

  // Priority 4: Production same-origin
  return window.location.origin;
};

export const API_URL = getApiURL();
