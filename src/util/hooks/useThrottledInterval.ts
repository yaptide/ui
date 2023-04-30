import { useEffect, useRef, useState } from 'react';

const useThrottledInterval = (
	callback: () => PromiseLike<void>,
	interval: number | null
): boolean => {
	const timeoutRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);
	const [isRunning, setIsRunning] = useState(false);

	// Update callback function if it changes
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	// Start interval
	useEffect(() => {
		function tick() {
			// Clear any previous timeout
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}

			// Call callback function
			const promise = Promise.resolve(callbackRef.current());

			// Wait for promise to resolve before setting new timeout
			promise.then(() => {
				if (interval !== null) timeoutRef.current = window.setTimeout(tick, interval);
			});

			// Set running state to true
			setIsRunning(true);
		}

		// Start interval
		tick();

		// Set running state to true
		setIsRunning(true);

		// Clean up function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [interval]);

	// Return isRunning state
	return isRunning;
};

export default useThrottledInterval;
