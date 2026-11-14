import { LanguageDescription, StreamLanguage, StringStream } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Extension } from '@uiw/react-codemirror';

type LineState = {
	firstWord: boolean;
	titleLine: boolean;
	nextLineIsTitle: boolean;
};

const NUMBER = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eEdD][-+]?\d+)?/;
const WORD = /^[A-Za-z_][\w.-]*/;
const GEANT4_UNITS = new Set([
	'nm',
	'um',
	'mm',
	'cm',
	'm',
	'km',
	'eV',
	'keV',
	'MeV',
	'GeV',
	'TeV',
	'deg',
	'rad',
	'mrad',
	'ns',
	's'
]);

const startState = (): LineState => ({ firstWord: true, titleLine: false, nextLineIsTitle: false });

const copyState = (state: LineState): LineState => ({ ...state });

const startLine = (state: LineState) => {
	state.firstWord = true;
	state.titleLine = state.nextLineIsTitle;
	state.nextLineIsTitle = false;
};

const firstWordStyle = (state: LineState, style: string | null) => {
	const isFirst = state.firstWord;
	state.firstWord = false;

	return isFirst ? 'keyword' : style;
};

export const shieldhitLanguage = StreamLanguage.define<LineState>({
	name: 'shieldhit',
	startState,
	copyState,
	token(stream: StringStream, state: LineState) {
		if (stream.sol()) startLine(state);

		if (stream.sol() && stream.match(/^\s*[*#]/)) {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.eatSpace()) return null;

		if (stream.peek() === '!') {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.match(NUMBER)) {
			state.firstWord = false;

			return 'number';
		}

		if (stream.match(WORD)) return firstWordStyle(state, null);

		stream.next();
		state.firstWord = false;

		return 'operator';
	}
});

export const flukaLanguage = StreamLanguage.define<LineState>({
	name: 'fluka',
	startState,
	copyState,
	blankLine: startLine,
	token(stream: StringStream, state: LineState) {
		if (stream.sol()) startLine(state);

		if (state.titleLine) {
			stream.skipToEnd();

			return 'string';
		}

		if (stream.sol() && stream.eat('*')) {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.sol() && stream.match(/^[#$]\S*/)) {
			state.firstWord = false;

			return 'meta';
		}

		if (stream.eatSpace()) return null;

		if (stream.peek() === '!') {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.match(NUMBER)) {
			state.firstWord = false;

			return 'number';
		}

		const word = stream.match(WORD);

		if (word) {
			const text = (word as RegExpMatchArray)[0];

			if (state.firstWord && text.toUpperCase() === 'TITLE') state.nextLineIsTitle = true;

			return firstWordStyle(state, /^[A-Z][A-Z0-9_-]*$/.test(text) ? 'atom' : null);
		}

		stream.next();
		state.firstWord = false;

		return null;
	}
});

export const geant4MacroLanguage = StreamLanguage.define<LineState>({
	name: 'geant4-macro',
	startState,
	copyState,
	token(stream: StringStream, state: LineState) {
		if (stream.sol()) startLine(state);

		if (stream.eatSpace()) return null;

		if (stream.peek() === '#') {
			stream.skipToEnd();

			return 'comment';
		}

		if (state.firstWord && stream.match(/^\/\S+/)) {
			state.firstWord = false;

			return 'keyword';
		}

		state.firstWord = false;

		if (stream.match(NUMBER)) return 'number';

		const word = stream.match(WORD);

		if (word) return GEANT4_UNITS.has((word as RegExpMatchArray)[0]) ? 'unit' : null;

		stream.next();

		return null;
	}
});

export const plainTextLanguage = StreamLanguage.define<LineState>({
	name: 'plain-text',
	startState,
	copyState,
	token(stream: StringStream) {
		if (stream.sol() && stream.match(/^\s*\*/)) {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.eatSpace()) return null;

		if (stream.match(/^(?:#|!|\/\/)/)) {
			stream.skipToEnd();

			return 'comment';
		}

		if (stream.match(/^"(?:[^"\\]|\\.)*"/) || stream.match(/^'(?:[^'\\]|\\.)*'/))
			return 'string';

		if (stream.match(NUMBER)) return 'number';

		if (stream.match(WORD)) return null;

		stream.next();

		return null;
	}
});

const SIMULATOR_LANGUAGES: Record<string, Extension> = {
	dat: shieldhitLanguage,
	inp: flukaLanguage,
	mac: geant4MacroLanguage
};

const SAME_LANGUAGE_AS: Record<string, string> = {
	gdml: 'xml'
};

const fileExtension = (name: string) =>
	name.includes('.') ? (name.toLowerCase().split('.').pop() ?? '') : '';

export function fileTypeLanguage(name: string): LanguageDescription | null {
	const extension = fileExtension(name);

	return LanguageDescription.matchFilename(
		languages,
		SAME_LANGUAGE_AS[extension] ? `file.${SAME_LANGUAGE_AS[extension]}` : name
	);
}

export async function loadLanguageForFile(name: string): Promise<Extension> {
	const simulatorLanguage = SIMULATOR_LANGUAGES[fileExtension(name)];

	if (simulatorLanguage) return simulatorLanguage;

	const description = fileTypeLanguage(name);

	if (!description) return plainTextLanguage;

	try {
		return await description.load();
	} catch (error) {
		console.error(error);

		return plainTextLanguage;
	}
}
