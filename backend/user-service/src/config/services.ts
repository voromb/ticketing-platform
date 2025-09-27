export const SERVICES_CONFIG = {
  ADMIN_SERVICE: {
    BASE_URL: process.env.ADMIN_SERVICE_URL || 'http://localhost:3003',
    ENDPOINTS: {
      EVENTS: '/api/events',
      PUBLIC_EVENTS: '/api/events/public',
      VENUES: '/api/venues',
      HEALTH: '/health'
    }
  },
  USER_SERVICE: {
    BASE_URL: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    PORT: process.env.PORT || 3001
  }
};

export default SERVICES_CONFIG;
