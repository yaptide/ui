import { DEPLOYMENT } from '../config/ConfigService';

function logDateFormat(date: Date) {
	let dataFormat: RegExpExecArray | null | [string] = /\d\d\:\d\d\:\d\d/.exec(date.toString()); // eslint-disable-line
	// if null fill date with 0
	if (dataFormat === null) dataFormat = ['00:00:00'];
	return `[${dataFormat[0]}]`;
}

export function devLog(...args: unknown[]) {
	if (DEPLOYMENT === 'dev') console.log(logDateFormat(new Date()), ...args);
}
