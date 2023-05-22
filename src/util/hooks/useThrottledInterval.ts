import { useEffect, useRef } from 'react';
const useThrottledInterval = (callback: () => PromiseLike<void>, interval: number | null): void => {
	const timeoutRef = useRef<number | null>(null);
	const callbackRef = useRef(callback);

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
				if (interval !== null) timeoutRef.current = window.setTimeout(tick, interval);
				return; // exit function
			}

			// Call callback function
			const promise = Promise.resolve(callbackRef.current());

			// Wait for promise to resolve before setting new timeout
			promise.then(() => {
				if (interval !== null) timeoutRef.current = window.setTimeout(tick, interval);
			});
		}

		// Start interval
		tick();

		// Clean up function
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, [interval]);
};

export default useThrottledInterval;
