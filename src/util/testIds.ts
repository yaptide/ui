// Central registry of `data-testid` values.
// Conventions:
//  - all values are kebab-case,
//  - no UI copy and no file names are used as discriminators,
//  - values must be unique across the whole DOM (hidden TabPanels stay mounted),
//  - format: `<area>-<component>-<element>[-<discriminator>]`.

const kebab = (value: string) =>
	value
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/[^a-zA-Z0-9]+/g, '-')
		.toLowerCase();

// Stable domain keys for the code editors, so `data-testid` does not depend on file names.
const INPUT_FILE_DOMAIN_KEYS: Record<string, string> = {
	'geometry.gdml': 'geometry',
	'run.mac': 'run',
	'fl_sim.inp': 'fluka-sim',
	'geo.dat': 'geometry',
	'beam.dat': 'beam',
	'detect.dat': 'detector',
	'mat.dat': 'materials',
	'sobp.dat': 'sobp',
	'info.json': 'info'
};

export const testIds = {
	navDrawer: 'nav-drawer',
	navItem: (value: string) => `nav-item-${kebab(value)}`,
	examplesSection: (simulator: string) => `examples-section-${kebab(simulator)}`,
	examplesChip: (simulator: string, index: number) =>
		`examples-chip-${kebab(simulator)}-${index}`,
	dialog: (key: string) => `dialog-${key}`,
	dialogTitle: (key: string) => `dialog-${key}-title`,
	dialogContent: (key: string) => `dialog-${key}-content`,
	menuButton: (name: string) => `menu-${name}-button`,
	menuPopup: (name: string) => `menu-${name}-popup`,
	menuItem: (name: string, index: number) => `menu-${name}-item-${index}`,
	simulatorStatus: 'simulator-controls-status',
	simulatorSelect: 'simulator-controls-select',
	simulatorRun: 'simulator-controls-run',
	simulatorPopover: 'simulator-controls-popover',
	simulatorOption: (simulator: string) => `simulator-option-${kebab(simulator)}`,
	inputEditorGenerate: 'input-editor-generate',
	inputFileEditor: (fileName: string, index: number) => {
		const key = INPUT_FILE_DOMAIN_KEYS[fileName];

		if (!key && process.env.NODE_ENV !== 'production') {
			// eslint-disable-next-line no-console
			console.warn(
				`[testIds] No domain key for input file "${fileName}". ` +
					`Falling back to "input-file-editor-file-${index}". ` +
					`Add the file to INPUT_FILE_DOMAIN_KEYS in src/util/testIds.ts.`
			);
		}

		return `input-file-editor-${key ?? `file-${index}`}`;
	},
	projectTitleButton: 'project-title-button'
} as const;
