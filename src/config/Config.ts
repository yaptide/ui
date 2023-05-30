declare global {
	interface Window {
		BACKEND_URL?: string;
	}
}

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL ?? 'http://localhost:5000';
window.BACKEND_URL = BACKEND_URL;
export const DEMO_MODE = process.env.REACT_APP_TARGET === 'demo';
export const ALT_AUTH = process.env.REACT_APP_ALT_AUTH === 'plg';
