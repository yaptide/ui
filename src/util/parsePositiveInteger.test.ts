import { parsePositiveInteger } from './parsePositiveInteger';

test('accepts positive integers', () => {
	expect(parsePositiveInteger('1')).toBe(1);
	expect(parsePositiveInteger('20000')).toBe(20000);
	expect(parsePositiveInteger('1e3')).toBe(1000);
});

test('rejects empty, zero, negative and fractional values', () => {
	expect(parsePositiveInteger('')).toBeNaN();
	expect(parsePositiveInteger(' ')).toBeNaN();
	expect(parsePositiveInteger('0')).toBeNaN();
	expect(parsePositiveInteger('0000')).toBeNaN();
	expect(parsePositiveInteger('-5')).toBeNaN();
	expect(parsePositiveInteger('1.5')).toBeNaN();
});

test('rejects values above the safe integer range', () => {
	expect(parsePositiveInteger('9007199254740993')).toBeNaN();
});
