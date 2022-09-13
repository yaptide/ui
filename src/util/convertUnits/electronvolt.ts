const SI = {
  eV: {
    name: {
      singular: 'Electronvolt',
      plural: 'Electronvolts',
    },
    to_anchor: 1,
  },
  neV: {
    name: {
      singular: 'Nano-Electronvolt',
      plural: 'Nano-Electronvolt',
    },
    to_anchor: 1e-9,
  },
  µeV: {
    name: {
      singular: 'Micro-Electronvolt',
      plural: 'Micro-Electronvolt',
    },
    to_anchor: 1e-6,
  },
  meV: {
    name: {
      singular: 'Milli-Electronvolt',
      plural: 'Milli-Electronvolt',
    },
    to_anchor: 1e-3,
  },
  keV: {
    name: {
      singular: 'Kilo-Electronvolt',
      plural: 'Kilo-Electronvolts',
    },
    to_anchor: 1e+3,
  },
  MeV: {
    name: {
      singular: 'Mega-Electronvolt',
      plural: 'Mega-Electronvolts',
    },
    to_anchor: 1e+6,
  },
  GeV: {
    name: {
      singular: 'Giga-Electronvolt',
      plural: 'Giga-Electronvolts',
    },
    to_anchor: 1e+9,
  },
};

const electronVolt = {
  systems: {
    SI,
  },
};

export default electronVolt;