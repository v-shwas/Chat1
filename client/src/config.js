// Resolve the API base URL.
//
// Production: set VITE_API_URL to your backend origin, e.g.
//   VITE_API_URL=https://your-app.onrender.com
// Development: falls back to the current hostname on port 3000 so the app
// works on localhost AND when accessed from another device on your network.
const SERVER_PORT = 3000;

const getDevBaseUrl = () => {
  const protocol = window.location.protocol; // http: or https:
  const hostname = window.location.hostname;
  return `${protocol}//${hostname}:${SERVER_PORT}`;
};

// Strip any trailing slash so we can safely append paths.
const ENV_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

const getBaseUrl = () => ENV_URL || getDevBaseUrl();

export const API_BASE = `${getBaseUrl()}/api`;
export const SOCKET_URL = getBaseUrl();
