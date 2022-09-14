import { Measure } from "convert-units";

export type BaseUnits = BaseSIUnits;
export type BaseSystems = 'SI';

export type BaseSIUnits = keyof typeof SI;


const SI = {
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

export const possibleBaseUnits = Object.keys(SI) as BaseSIUnits[];

export const isBaseUnit = (unit: string): unit is BaseSIUnits => possibleBaseUnits.includes(unit as BaseSIUnits);

const baseMeasure: Measure<BaseSystems, BaseUnits> = {
  systems: {
    SI,
  },
};

export default baseMeasure;