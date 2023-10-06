export const millisecondsToTimeString = (milliseconds: number): string => {
	const seconds = Math.floor(milliseconds / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	const secondsString = (seconds % 60).toString().padStart(2, '0');
	const minutesString = (minutes % 60).toString().padStart(2, '0');
	const hoursString = hours.toString().padStart(2, '0');

	return `${hoursString}:${minutesString}:${secondsString}`;
};
