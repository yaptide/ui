export enum SCORING_QUANTITY_TYPES {
	'cellCharge' = 'cellCharge',
	'cellFlux' = 'cellFlux',
	'doseDeposit' = 'doseDeposit',
	'energyDeposit' = 'energyDeposit',
	'flatSurfaceCurrent' = 'flatSurfaceCurrent',
	'flatSurfaceFlux' = 'flatSurfaceFlux'
}

export const SCORING_QUANTITY_UNITS = {
	cellCharge: ['e+'],
	cellFlux: ['cm^-2'],
	doseDeposit: ['mGy', 'Gy'],
	energyDeposit: ['meV', 'eV', 'keV', 'MeV', 'GeV'],
	flatSurfaceCurrent: ['cm^-2'],
	flatSurfaceFlux: ['cm^-2']
};

export const X_AXIS_SCALE_OPTS = ['linear', 'log', 'log10'] as const;

export const X_AXIS_BIN_SCHEME_OPTS = ['linear', 'log'] as const;
