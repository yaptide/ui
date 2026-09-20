export const millisecondsToTimeString = (milliseconds: number): string => {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	return [hours, minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':'); // hh:mm:ss
};

export const secondsToShortDurationString = (seconds: number): string => {
	if (seconds < 1) {
		return '<1s';
	}

	const totalSeconds = Math.ceil(seconds);

	if (totalSeconds < 60) {
		return `${totalSeconds}s`;
	}

	const minutes = Math.floor(totalSeconds / 60);
	const remainingSeconds = totalSeconds % 60;

	return `${minutes}m ${remainingSeconds}s`;
};
