const getSessionId = () => {
  let sessionId = sessionStorage.getItem('mireakart_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
    sessionStorage.setItem('mireakart_session_id', sessionId);
  }
  return sessionId;
};

export const logEvent = async (eventType, path, metadata = {}) => {
  try {
    const sessionId = getSessionId();
    const token = localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    await fetch('/api/analytics/log', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        eventType,
        path: path || window.location.pathname,
        metadata,
        sessionId,
      }),
    });
  } catch (error) {
    console.error('Failed to log telemetry event:', error);
  }
};
