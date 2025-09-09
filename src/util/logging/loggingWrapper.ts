import ky from 'ky';

import { DEDUP_WINDOW_MS, FLUSH_INTERVAL, MAX_LOGS } from '../../config/ConfigService';
// Assuming these constants are defined in a separate file
let backendUrl = '';

type LogEntry = {
	timestamp: string;
	level: string;
	message: string;
	browser: string;
	user_ip: string;
};

const logBuffer: LogEntry[] = [];
const logDedupMap: Map<string, number> = new Map();

const originalConsole = {
	log: console.log,
	error: console.error,
	warn: console.warn,
	info: console.info
};

const shouldLog = (message: string): boolean => {
	const now = Date.now();

	if (logDedupMap.has(message)) {
		const lastLogged = logDedupMap.get(message);

		if (lastLogged !== undefined && now - lastLogged < DEDUP_WINDOW_MS) {
			return false;
		}
	}

	logDedupMap.set(message, now);

	return true;
};

const flushLogs = async () => {
	if (!logBuffer.length) return;
	const logsToSend = [...logBuffer];
	logBuffer.length = 0;

	ky.post(backendUrl + '/logs', {
		json: { logs: logsToSend },
		credentials: 'include'
	})
		.then(() => {
			originalConsole.log('Logs sent successfully:', logsToSend);
		})
		.catch(error => {
			originalConsole.warn('Failed to send logs:', error);
			logBuffer.unshift(...logsToSend);
		});
};

export function stopLogSending() {
	flushLogs(); // Ensure any remaining logs are sent before stopping

	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}

	window.removeEventListener('beforeunload', flushLogs);
	originalConsole.log('Stopped log sending');
}

let intervalId: ReturnType<typeof setInterval> | null;

export const initializeLogging = (url: string) => {
	originalConsole.log('Initializing logging');

	backendUrl = url;

	if (intervalId) return; // Prevent multiple initializations

	intervalId = setInterval(flushLogs, FLUSH_INTERVAL);
	window.addEventListener('beforeunload', flushLogs);

	const levels = Object.keys(originalConsole) as Array<keyof typeof originalConsole>;

	levels.forEach(level => {
		console[level] = function (...args: unknown[]) {
			const message = args
				.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
				.join(' ');

			if (shouldLog(message)) {
				logBuffer.push({
					timestamp: new Date().toISOString(),
					level: level,
					message: message,
					browser: navigator.userAgent, // this may require some sanitization
					user_ip: '' // not sure how to fetch the IP
				});

				if (logBuffer.length >= MAX_LOGS) flushLogs();
			}

			originalConsole[level].apply(console, args);
		};
	});
};
