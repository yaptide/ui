import { UIPanel, UIText, UIRow } from './libs/ui.js';
import { UIBoolean } from './libs/ui.three.js';


function SidebarSettingsViewport(editor) {

	const { signals, strings } = editor;

	var container = new UIPanel();

	var headerRow = new UIRow();
	headerRow.add(new UIText(strings.getKey('sidebar/settings/viewport').toUpperCase()));
	container.add(headerRow);

	// grid

	var showGridRow = new UIRow();

	showGridRow.add(new UIText(strings.getKey('sidebar/settings/viewport/grid')).setWidth('90px'));

	var showGrid = new UIBoolean(true).onChange(() => {

		signals.showGridChanged.dispatch(showGrid.getValue());

	});
	showGridRow.add(showGrid);
	container.add(showGridRow);

	// helpers

	var showHelpersRow = new UIRow();

	showHelpersRow.add(new UIText(strings.getKey('sidebar/settings/viewport/helpers')).setWidth('90px'));

	var showHelpers = new UIBoolean(true).onChange(() => {

		signals.showHelpersChanged.dispatch(showHelpers.getValue());

	});
	showHelpersRow.add(showHelpers);
	container.add(showHelpersRow);

	// zones YAPTIDE

	var showZonesRow = new UIRow();

	showZonesRow.add(new UIText("Zones").setWidth('90px'));

	var showZones = new UIBoolean(true).onChange(() => {

		signals.showZonesChanged.dispatch(showZones.getValue());

	});
	showZonesRow.add(showZones);
	container.add(showZonesRow);

	return container;

}

export { SidebarSettingsViewport };
