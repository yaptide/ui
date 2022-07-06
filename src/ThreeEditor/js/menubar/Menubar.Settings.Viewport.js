import { UIPanel, UIText, UIRow } from '../libs/ui.js';
import { UIBoolean } from '../libs/ui.three.js';

function MenubarSettingsViewport(editor) {
	const { signals } = editor;

	const container = new UIPanel();

	const headerRow = new UIRow();
	headerRow.add(new UIText('VIEWPORT'));
	container.add(headerRow);

	// grid

	const showGridRow = new UIRow();

	showGridRow.add(new UIText('Grid').setWidth('90px'));

	const showGrid = new UIBoolean(true).onChange(() => {
		signals.showGridChanged.dispatch(showGrid.getValue());
	});
	showGridRow.add(showGrid);
	container.add(showGridRow);

	// helpers

	const showHelpersRow = new UIRow();

	showHelpersRow.add(new UIText('Helpers').setWidth('90px'));

	const showHelpers = new UIBoolean(true).onChange(() => {
		signals.showHelpersChanged.dispatch(showHelpers.getValue());
	});
	showHelpersRow.add(showHelpers);
	container.add(showHelpersRow);

	return container;
}

export { MenubarSettingsViewport };
