import { converterErrorMessage } from './converterErrorMessage';

const traceback = [
	'Traceback (most recent call last):',
	'  File "/lib/python3.11/site-packages/converter/shieldhit/parser.py", line 297, in _get_detector_by_uuid',
	'    raise ValueError(f"No detector with uuid {detect_uuid}")',
	'ValueError: No detector with uuid 6E0F0550-4464-4FAF-8213-945EEEDB3D06',
	''
].join('\n');

describe('converterErrorMessage', () => {
	test('returns the message of the last Python exception', () => {
		expect(converterErrorMessage(new Error(traceback))).toBe(
			'No detector with uuid 6E0F0550-4464-4FAF-8213-945EEEDB3D06'
		);
	});

	test('keeps the type of other exceptions', () => {
		expect(converterErrorMessage(new Error("KeyError: 'energyUnit'"))).toBe(
			"KeyError: 'energyUnit'"
		);

		expect(
			converterErrorMessage(new Error('pyodide.ffi.JsException: TypeError: x is null'))
		).toBe('pyodide.ffi.JsException: TypeError: x is null');
	});

	test('keeps plain messages', () => {
		expect(converterErrorMessage(new Error('converterFileName is not defined'))).toBe(
			'converterFileName is not defined'
		);
		expect(converterErrorMessage('worker terminated')).toBe('worker terminated');
	});

	test('shortens very long messages', () => {
		const message = converterErrorMessage(new Error(`ValueError: ${'x'.repeat(1000)}`));

		expect(message).toHaveLength(301);
		expect(message?.endsWith('…')).toBe(true);
	});

	test('returns undefined when there is nothing to show', () => {
		expect(converterErrorMessage(new Error(''))).toBeUndefined();
		expect(converterErrorMessage(undefined)).toBeUndefined();
		expect(converterErrorMessage({ message: 'not an error' })).toBeUndefined();
	});
});
