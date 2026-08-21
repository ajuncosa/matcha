// Central place for the backend URLs. Values come from Vite env vars (see
// frontend/.env); the fallbacks match the default docker/nginx setup so the app
// still runs if the env file is missing.

/** Base URL for REST API calls, e.g. `${API_URL}/auth/login`. */
export const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost/api";

/** Origin the Socket.IO client connects to. */
export const SOCKET_URL: string = import.meta.env.VITE_SOCKET_URL || "http://localhost";
