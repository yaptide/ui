export const RULE_UNITS = {
	A: '',
	AMASS: 'MeV/c²',
	AMU: 'au',
	E: 'MeV',
	ENUC: 'MeV/n',
	EAMU: 'MeV/amu',
	ID: '',
	GEN: '',
	NPRIM: '',
	Z: ''
} as const;

export const RULE_DEFAULTS = {
	A: ['equal', 4],
	AMASS: ['less_than', 1.0],
	AMU: ['less_than', 1.0],
	E: ['less_than', 1.0],
	ENUC: ['less_than', 10.0],
	EAMU: ['less_than_or_equal', 10.0],
	ID: ['equal', 1],
	GEN: ['equal', 1],
	NPRIM: ['equal', 2],
	Z: ['equal', 1]
} as const;

export const RULE_VALUE_RANGES = {
	A: [0, 500],
	AMASS: [0.0, 500.0],
	AMU: [0.0, 500.0],
	Z: [0, 149],
	E: [0.0, Infinity],
	ENUC: [0.0, Infinity],
	EAMU: [0.0, Infinity],
	GEN: [0, 20],
	NPRIM: [1, Infinity],
	ID: [1, 20]
} as const;

const _rule_descriptions = {
	A: 'Filters by the atomic mass number A of the particles.',
	AMASS: 'Filters by the mass of the particles.',
	AMU: 'Filters by the mass of the particles in atomic units.',
	E: 'Filters by the kinetic energy of the particles.',
	ENUC: 'Filters by the kinetic energy per nucleon.',
	EAMU: 'Filters by the kinetic energy per amu.',
	ID: 'Filters by the type of the particles.',
	GEN: 'Filters by the generation of the particles.',
	NPRIM: 'Filters by the number of primary particles.',
	Z: 'Filters by the charge number [z] of the particles.'
} as const;

const _float_keywords = ['AMASS', 'AMU', 'E', 'ENUC', 'EAMU'] as const;

const _int_keywords = ['A', 'GEN', 'NPRIM', 'Z'] as const;

const _id_keywords = ['ID'] as const;

const _operators = {
	'==': '=',
	'!=': '≠',
	'<': '<',
	'<=': '≤',
	'>': '>',
	'>=': '≥'
} as const;

export const OPERATOR_OPTIONS = Object.entries(_operators).reduce((acc, [key, text]) => {
	acc[key] = text;
	return acc;
}, {} as Record<string, string>);

export const KEYWORD_OPTIONS = Object.entries(_rule_descriptions).reduce((acc, [key]) => {
	acc[key] = key;
	return acc;
}, {} as Record<string, string>);

export function KEYWORD_SORT_ORDER(a: string, b: string) {
	const order = ['A', 'AMASS', 'AMU', 'Z', 'GEN', 'E', 'ENUC', 'EAMU', 'ID', 'NPRIM'];
	return order.indexOf(a) - order.indexOf(b);
}

const _notOperator = '&#172;' as const;

const _particles = {
	1: ['Hadron', 'H'],
	2: ['Anti-hadron', 'H'],
	3: ['Pion π-', 'π-'],
	4: ['Pion π+', 'π+'],
	5: ['Pion π0', 'π0'],
	8: ['Kaon κ-', 'κ-'],
	9: ['Kaon κ+', 'κ+'],
	10: ['Kaon κ0', 'κ0'],
	11: ['Kaon κ∼', 'κ∼'],
	12: ['Gamma radiation', 'γ'],
	13: ['Electron', 'e−'],
	14: ['Positron', 'e+'],
	15: ['Muon', 'μ-'],
	16: ['Anti-muon', 'μ+'],
	17: ['Electron neutrino', 'νe'],
	18: ['Electron anti-neutrino', 'νe'],
	19: ['Muon neutrino', 'νµ'],
	20: ['Muon anti-neutrino', 'νµ']
} as const;

export const PARTICLE_OPTIONS = Object.entries(_particles).reduce((acc, [id, [name]]) => {
	acc[id] = `<span>${name}</span>`;
	return acc;
}, {} as Record<string, string>);

function textDecoration(id: number) {
	return [2, 18, 20].includes(id) ? 'overline' : null;
}

export type F_Keyword = typeof _float_keywords[number];
export type I_Keyword = typeof _int_keywords[number];
export type ID_Keyword = typeof _id_keywords[number];

export type Keyword = F_Keyword | I_Keyword | ID_Keyword;
export function isValidKeyword(
	keyword: string,
	type: 'INT' | 'FLOAT' | 'ID' | 'ANY' = 'ANY'
): keyword is Keyword {
	const sets = [_float_keywords, _int_keywords, _id_keywords] as const;
	switch (type) {
		case 'FLOAT':
			return sets[0].includes(keyword as F_Keyword);
		case 'INT':
			return sets[1].includes(keyword as I_Keyword);
		case 'ID':
			return sets[2].includes(keyword as ID_Keyword);
		case 'ANY':
			return sets.flat().includes(keyword as Keyword);
	}
}
export function getDescription(keyword: string): string {
	return isValidKeyword(keyword) ? _rule_descriptions[keyword] : 'Invalid rule';
}

export type Operator = keyof typeof _operators;
export function isValidOperator(operator: string): operator is Operator {
	return operator in _operators;
}

export type OperatorSymbol = typeof _operators[Operator] | typeof _notOperator;
export function getOperator(operator: string) {
	return isValidOperator(operator) ? _operators[operator] : _notOperator;
}

export type ParticleId = keyof typeof _particles;
export function isValidID(id: number): id is ParticleId {
	return id in Object.keys(_particles);
}

export type Particle = typeof _particles[ParticleId];
export function getParticle(id: number) {
	return isValidID(id) ? _particles[id] : null;
}
