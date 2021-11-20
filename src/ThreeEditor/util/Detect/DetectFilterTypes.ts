const _float_keywords = ['AMASS', 'AMU', 'E', 'ENUC', 'EAMU'] as const;

const _int_keywords = ['A', 'GEN', 'NPRIM', 'Z'] as const;

const _id_keywords = ['ID'] as const;

const _operators = {
	equal: '&#61;',
	not_equal: '&#8800;',
	less_than: '&#60;',
	less_than_or_equal: '&#8804;',
	greater_than: '&#62;',
	greater_than_or_equal: '&#8805;',
} as const;

const _notOperator = '&#172;' as const;

const _particles = {
	1: 'Hadrons',
	2: 'Anti-hadrons',
	3: 'pi- meson',
	4: 'pi+ meson',
	5: 'pi0 meson',
	8: 'K-',
	9: 'K+',
	10: 'K0',
	11: 'K∼',
	12: 'γ-ray',
	13: 'electron',
	14: 'positron',
	15: 'µ-',
	16: 'µ+',
	17: 'νe electron neutrino',
	18: 'νe electron anti-neutrino',
	19: 'νµ mu neutrino',
	20: 'νµ mu anti-neutrino',
} as const;

export type F_Keyword = typeof _float_keywords[number];
export type I_Keyword = typeof _int_keywords[number];
export type ID_Keyword = typeof _id_keywords[number];

export type Keyword = F_Keyword | I_Keyword | ID_Keyword;
export function isValidKeyword(keyword: string, type: 'INT' | 'FLOAT' | 'ID' | 'ANY' = 'ANY'): keyword is Keyword {
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

export type Operator = keyof typeof _operators;
export function isValidOperator(operator: string): operator is Operator {
	return operator in _operators;
}

export type OperatorSymbol = typeof _operators[Operator] | typeof _notOperator;
export function getOperator(operator: string) {
	if (isValidOperator(operator)) {
		return _operators[operator];
	} else {
		return _notOperator;
	}
}

export type ParticleId = keyof typeof _particles;
export function isValidID(id: number): id is ParticleId {
	return id in Object.keys(_particles);
}

export type Particle = typeof _particles[ParticleId];
export function getParticle(id: number) {
	if (isValidID(id)) {
		return _particles[id];
	} else {
		return _particles[1];
	}
}
