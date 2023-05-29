import { useEffect, useRef } from 'react';
import { setIntervalAsync, clearIntervalAsync } from 'set-interval-async';

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
