import { UIPanel, UIText, UIRow, UIButton } from '../libs/ui.js';
import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import * as Cmd from '../commands/Commands';

function SidebarAddPanel(editor, parent, title, names, commands) {
	const container = new UIPanel();

	// Header
	const headerRow = new UIRow();
	headerRow.add(new UIText(title.toUpperCase()));
	container.add(headerRow);

	// Buttons

	const btnRow = new UIRow();

	names.forEach((name, index) => {
		const button = new UIButton(name);
		button.onClick(function () {
			editor.execute(commands[index]);
		});
		btnRow.add(button);
	});

	container.add(btnRow);
	parent.add(container);

	return container;
}

export function DetectAddPanel(editor, container) {
	return SidebarAddPanel(
		editor,
		container,
		'Add Detect',
		['Geometry', 'Filter', 'Quantity'],
		[
			new Cmd.AddDetectGeometryCommand(editor),
			new Cmd.AddFilterCommand(editor),
			new Cmd.AddFilterCommand(editor)
		]
	);
}

export function FigureAddPanel(editor, container) {
	return SidebarAddPanel(
		editor,
		container,
		'Add Figure',
		['Box', 'Cylinder', 'Sphere'],
		[
			new Cmd.AddObjectCommand(editor, new BoxMesh()),
			new Cmd.AddObjectCommand(editor, new CylinderMesh()),
			new Cmd.AddObjectCommand(editor, new SphereMesh())
		]
	);
}

export function ZoneAddPanel(editor, container) {
	return SidebarAddPanel(
		editor,
		container,
		'Add Zone',
		['Constructive solid Zone'],
		[new Cmd.AddZoneCommand(editor)]
	);
}
