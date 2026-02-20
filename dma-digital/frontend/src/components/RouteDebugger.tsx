import { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export const RouteDebugger = () => {
  const location = useLocation();
  const params = useParams();

  useEffect(() => {
    console.log('🔍 Route Debugger - Component mounted/updated');
    console.log('🔍 Route Debugger - Pathname:', location.pathname);
    console.log('🔍 Route Debugger - Full location:', {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      params,
      state: location.state,
    });
    console.log('🔍 Route Debugger - Window location:', window.location.pathname);
  }, [location, params]);

  return null;
};
