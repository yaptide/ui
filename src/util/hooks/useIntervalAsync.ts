import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';
import { useEffect, useRef } from 'react';

function useIntervalAsync(
	callback: () => Promise<void>,
	delay?: number,
	immediate: boolean = delay === undefined
) {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		let interval: ReturnType<typeof setIntervalAsync> | null = null;
		if (immediate) callbackRef.current();
		else interval = setIntervalAsync(callbackRef.current, delay!);
		return () => {
			if (interval) clearIntervalAsync(interval);
		};
	}, [delay, immediate]);
}

export default useIntervalAsync;
