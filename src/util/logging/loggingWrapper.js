import ky from 'ky';

const logBuffer = [];
const MAX_LOGS = 20;
const FLUSH_INTERVAL = 5000;

const logDedupMap = new Map();
const DEDUP_WINDOW_MS = 10000; // 10 seconds

const shouldLog = message => {
	const now = Date.now();

	if (logDedupMap.has(message)) {
		const lastLogged = logDedupMap.get(message);

		if (now - lastLogged < DEDUP_WINDOW_MS) {
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

	ky.post('http://localhost:5000/logs', {
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

setInterval(flushLogs, FLUSH_INTERVAL);
window.addEventListener('beforeunload', flushLogs);

// Save native console functions
const originalConsole = {
	log: console.log,
	error: console.error,
	warn: console.warn,
	info: console.info
};

['log', 'error', 'warn', 'info'].forEach(level => {
	console[level] = function (...args) {
		const message = args
			.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg)))
			.join(' ');

		if (shouldLog(message)) {
			logBuffer.push({
				level,
				message,
				timestamp: new Date().toISOString(),
				url: window.location.href
			});

			if (logBuffer.length >= MAX_LOGS) flushLogs();
		}

		originalConsole[level].apply(console, args);
	};
});
