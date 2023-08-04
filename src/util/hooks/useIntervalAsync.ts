import { useEffect } from 'react';
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async';

function useIntervalAsync(
	callback: () => Promise<void>,
	delay?: number,
	immediate: boolean = delay === undefined
) {
	useEffect(() => {
		let interval: ReturnType<typeof setIntervalAsync> | null = null;

		if (immediate) callback();
		if (delay !== undefined) interval = setIntervalAsync(callback, delay);

		return () => {
			if (interval) clearIntervalAsync(interval);
		};
	}, [delay, immediate, callback]);
}

export default useIntervalAsync;
