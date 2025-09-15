import ky, { KyInstance } from 'ky';

import { DEDUP_WINDOW_MS, FLUSH_INTERVAL, MAX_LOGS } from '../../config/ConfigService';

type LogEntry = {
	timestamp: string;
	level: string;
	message: string;
	browser: string;
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

const flushLogs = async (kyRef: KyInstance) => {
	if (!logBuffer.length) return;
	const logsToSend = [...logBuffer];
	logBuffer.length = 0;

	kyRef
		.post('logs', {
			json: { logs: logsToSend }
		})
		.then(() => {
			originalConsole.log('Logs sent successfully:', logsToSend);
		})
		.catch(error => {
			originalConsole.warn('Failed to send logs:', error);

			if (logBuffer.length + logsToSend.length <= MAX_LOGS * 5) {
				logBuffer.unshift(...logsToSend);
			} else {
				const excess = logBuffer.length + logsToSend.length - MAX_LOGS * 5;
				originalConsole.warn(`Dropping ${excess} oldest logs to prevent overflow`);

				//remove oldest logs
				logsToSend.splice(0, excess);
				logBuffer.unshift(...logsToSend);
			}
		});
};

let intervalId: ReturnType<typeof setInterval> | null;

export function stopLogSending(kyRef: KyInstance) {
	flushLogs(kyRef); // Ensure any remaining logs are sent before stopping

	if (intervalId) {
		clearInterval(intervalId);
		intervalId = null;
	}

	window.removeEventListener('beforeunload', () => flushLogs(kyRef));
	originalConsole.log('Stopped log sending');
}

export const initializeLogging = (kyRef: KyInstance) => {
	originalConsole.log('Initializing logging');

	if (intervalId) return; // Prevent multiple initializations

	intervalId = setInterval(() => flushLogs(kyRef), FLUSH_INTERVAL);
	window.addEventListener('beforeunload', () => flushLogs(kyRef));

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
					browser: navigator.userAgent // this may require some sanitization
				});

				if (logBuffer.length >= MAX_LOGS) flushLogs(kyRef);
			}

			originalConsole[level].apply(console, args);
		};
	});
};
