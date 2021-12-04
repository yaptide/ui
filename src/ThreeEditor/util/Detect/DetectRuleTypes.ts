export const _rule_units = {
	A: null,
	AMASS: 'MeV/c²',
	AMU: 'au',
	E: 'MeV',
	ENUC: 'MeV/n',
	EAMU: 'MeV/amu',
	ID: null,
	GEN: 'gen',
	NPRIM: null,
	Z: 'z'
} as const;

export const _rule_descriptions = {
	A: 'Filters the atomic mass number A of the particles.',
	AMASS: 'Filters the mass of the particles, measured in [MeV/c²].',
	AMU: 'Filters the mass of the particles, measured in atomic units.',
	E: 'Filters the kinetic energy of the particles, measured in [MeV].',
	ENUC: 'Filters the kinetic energy per nucleon, measured in [MeV/n].',
	EAMU: 'Filters the kinetic energy per atomic mass unit, measured in [MeV/amu].',
	ID: 'Filters the type of the particles.',
	GEN: 'Filters the generation number of the particles currently simulated.',
	NPRIM: 'Filters the number of primary particles.',
	Z: 'Filters the charge number [z] of the particles.'
} as const;

const _float_keywords = ['AMASS', 'AMU', 'E', 'ENUC', 'EAMU'] as const;

const _int_keywords = ['A', 'GEN', 'NPRIM', 'Z'] as const;

const _id_keywords = ['ID'] as const;

const _operators = {
	equal: '&#61;',
	not_equal: '&#8800;',
	less_than: '&#60;',
	less_than_or_equal: '&#8804;',
	greater_than: '&#62;',
	greater_than_or_equal: '&#8805;'
} as const;

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

export function textDecoration(id: number) {
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
