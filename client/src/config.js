// Dynamically resolve the API base URL.
// On localhost it uses localhost:3000
// On the network it uses the current hostname:3000
const SERVER_PORT = 3000;

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  return `http://${hostname}:${SERVER_PORT}`;
};

export const API_BASE = `${getBaseUrl()}/api`;
export const SOCKET_URL = getBaseUrl();
