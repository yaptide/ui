import { Measure, Unit } from "convert-units";

export type BaseUnits = BaseSIUnits;
export type BaseSystems = 'SI';

export type BaseSIUnits = keyof typeof SI;


const SI: Record<string, Unit> = {
  "": {
    name: {
      singular: '',
      plural: '',
    },
    to_anchor: 1,
  },
  n: {
    name: {
      singular: 'Nano',
      plural: 'Nano',
    },
    to_anchor: 1e-9,
  },
  µ: {
    name: {
      singular: 'Micro',
      plural: 'Micro',
    },
    to_anchor: 1e-6,
  },
  m: {
    name: {
      singular: 'Milli',
      plural: 'Milli',
    },
    to_anchor: 1e-3,
  },
  c: {
    name: {
      singular: 'Centy',
      plural: 'Centy',
    },
    to_anchor: 1e-2,
  },
  k: {
    name: {
      singular: 'Kilo',
      plural: 'Kilo',
    },
    to_anchor: 1e+3,
  },
  M: {
    name: {
      singular: 'Mega',
      plural: 'Mega',
    },
    to_anchor: 1e+6,
  },
  G: {
    name: {
      singular: 'Giga',
      plural: 'Giga',
    },
    to_anchor: 1e+9,
  },
};


const createSISystem = (baseUnit: string, anchorFactor: number) => {
  const newSystem: Record<string, Unit> = {};
  for (const property in SI) {
    newSystem[property + baseUnit] = {
      ...SI[property],
      to_anchor: Math.pow(SI[property].to_anchor, anchorFactor),
    }
  }
  return newSystem;
}

export const volumeMeasure: Measure<BaseSystems, BaseUnits> = {
  systems: {
    SI: createSISystem('m^3', 3),
  },
};

export const fluenceMeasure: Measure<BaseSystems, BaseUnits> = {
  systems: {
    SI: createSISystem('m^-2', 2),
  },
};

export const possibleBaseUnits = Object.keys(SI) as BaseSIUnits[];

export const isBaseUnit = (unit: string): unit is BaseSIUnits => possibleBaseUnits.includes(unit as BaseSIUnits);

export const baseMeasure: Measure<BaseSystems, BaseUnits> = {
  systems: {
    SI,
  },
};
