import { StreamLanguage } from '@codemirror/language';

import {
	fileTypeLanguage,
	flukaLanguage,
	geant4MacroLanguage,
	loadLanguageForFile,
	plainTextLanguage,
	shieldhitLanguage
} from '../inputFileLanguages';

const tokens = (language: StreamLanguage<unknown>, text: string) => {
	const result: string[] = [];

	language.parser.parse(text).iterate({
		enter: node => {
			if (node.from < node.to && node.type.name !== 'Document')
				result.push(`${node.type.name} ${text.slice(node.from, node.to)}`);
		}
	});

	return result;
};

describe('SHIELD-HIT12A', () => {
	test('keywords, numbers and comments', () => {
		expect(tokens(shieldhitLanguage, 'NSTAT       10000    0 ! Step of saving\n')).toEqual([
			'keyword NSTAT',
			'number 10000',
			'number 0',
			'comment ! Step of saving'
		]);
	});

	test('lines starting with * are comments', () => {
		expect(tokens(shieldhitLanguage, '* cylinder Water\n  RCC    1       0.0\n')).toEqual([
			'comment * cylinder Water',
			'keyword RCC',
			'number 1',
			'number 0.0'
		]);
	});

	test('only the first word of a line is a keyword', () => {
		expect(tokens(shieldhitLanguage, 'Geometry Cyl\n    Z == 1\n')).toEqual([
			'keyword Geometry',
			'keyword Z',
			'operator ==',
			'number 1'
		]);
	});
});

describe('FLUKA', () => {
	test('cards, numbers and SDUM', () => {
		expect(
			tokens(flukaLanguage, 'BEAM           -0.07       0.0       3.0      -1.0PROTON\n')
		).toEqual([
			'keyword BEAM',
			'number -0.07',
			'number 0.0',
			'number 3.0',
			'number -1.0',
			'atom PROTON'
		]);
	});

	test('the line after TITLE is the title', () => {
		expect(tokens(flukaLanguage, 'TITLE\nproton beam 2\nDEFAULTS\n')).toEqual([
			'keyword TITLE',
			'string proton beam 2',
			'keyword DEFAULTS'
		]);
	});

	test('comments and preprocessor lines', () => {
		expect(tokens(flukaLanguage, '* PROTON beam\n#define x\nSTOP ! end\n')).toEqual([
			'comment * PROTON beam',
			'meta #define',
			'keyword STOP',
			'comment ! end'
		]);
	});
});

describe('Geant4 macro', () => {
	test('commands, numbers, units and comments', () => {
		expect(tokens(geant4MacroLanguage, '# source\n/gps/ene/mono 150 MeV\n')).toEqual([
			'comment # source',
			'keyword /gps/ene/mono',
			'number 150',
			'unit MeV'
		]);
	});
});

describe('plain text', () => {
	test('numbers, closed quotes and common comments', () => {
		expect(
			tokens(plainTextLanguage, '* header\nsize 12.5e-3 "a b" \'c\' # note\nvalue 3 // end\n')
		).toEqual([
			'comment * header',
			'number 12.5e-3',
			'string "a b"',
			"string 'c'",
			'comment # note',
			'number 3',
			'comment // end'
		]);
	});

	test('an apostrophe inside a word does not start a string', () => {
		expect(tokens(plainTextLanguage, "don't stop 1\n")).toEqual(['number 1']);
	});
});

describe('loadLanguageForFile', () => {
	test.each([
		['beam.dat', shieldhitLanguage],
		['SOBP.DAT', shieldhitLanguage],
		['fl_sim.inp', flukaLanguage],
		['run.mac', geant4MacroLanguage],
		['notes.txt', plainTextLanguage],
		['README', plainTextLanguage],
		['table.csv', plainTextLanguage]
	])('%s', async (name, language) => {
		expect(await loadLanguageForFile(name)).toBe(language);
	});

	test.each([
		['geometry.gdml', 'XML'],
		['model.xml', 'XML'],
		['info.json', 'JSON'],
		['script.py', 'Python'],
		['config.yaml', 'YAML'],
		['notes.md', 'Markdown'],
		['Dockerfile', 'Dockerfile']
	])('%s gets the %s language', (name, languageName) => {
		expect(fileTypeLanguage(name)?.name).toBe(languageName);
	});

	test.each(['notes.txt', 'README', 'table.csv'])('%s has no file type language', name => {
		expect(fileTypeLanguage(name)).toBeNull();
	});
});
