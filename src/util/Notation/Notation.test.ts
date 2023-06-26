import { camelize, camelToSnakeCase, snakeize, snakeToCamelCase } from './Notation';

describe('Notation', () => {
	describe('camelToSnakeCase', () => {
		it('should convert camelCase to snake_case', () => {
			const obj = {
				firstName: 'John',
				lastName: 'Doe',
				address: {
					streetName: 'Main St',
					zipCode: '12345'
				}
			};
			const expected = {
				first_name: 'John',
				last_name: 'Doe',
				address: {
					streetName: 'Main St',
					zipCode: '12345'
				}
			};
			expect(camelToSnakeCase(obj)).toEqual(expected);
		});

		it('should convert camelCase to snake_case recursively', () => {
			const obj = {
				firstName: 'John',
				lastName: 'Doe',
				address: {
					streetName: 'Main St',
					zipCode: '12345'
				}
			};
			const expected = {
				first_name: 'John',
				last_name: 'Doe',
				address: {
					street_name: 'Main St',
					zip_code: '12345'
				}
			};
			expect(camelToSnakeCase(obj, true)).toEqual(expected);
		});

		it('should convert string from camelCase to snake_case', () => {
			const str = 'firstName';
			const expected = 'first_name';
			expect(snakeize(str)).toEqual(expected);
		});
	});

	describe('snakeToCamelCase', () => {
		it('should convert snake_case to camelCase', () => {
			const obj = {
				first_name: 'John',
				last_name: 'Doe',
				address: {
					street_name: 'Main St',
					zip_code: '12345'
				}
			};
			const expected = {
				firstName: 'John',
				lastName: 'Doe',
				address: {
					street_name: 'Main St',
					zip_code: '12345'
				}
			};
			expect(snakeToCamelCase(obj)).toEqual(expected);
		});

		it('should convert snake_case to camelCase recursively', () => {
			const obj = {
				first_name: 'John',
				last_name: 'Doe',
				address: {
					street_name: 'Main St',
					zip_code: '12345'
				}
			};
			const expected = {
				firstName: 'John',
				lastName: 'Doe',
				address: {
					streetName: 'Main St',
					zipCode: '12345'
				}
			};
			expect(snakeToCamelCase(obj, true)).toEqual(expected);
		});

		it('should convert string from snake_case to camelCase', () => {
			const str = 'first_name';
			const expected = 'firstName';
			expect(camelize(str)).toEqual(expected);
		});
	});
});
