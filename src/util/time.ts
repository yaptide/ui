export const millisecondsToTimeString = (milliseconds: number): string => {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	return [hours, minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':'); // hh:mm:ss
};
