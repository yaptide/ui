import { UIPanel, UIText, UIRow, UIButton } from '../libs/ui.js';
import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import {
	AddDetectGeometryCommand,
	AddFilterCommand,
	AddObjectCommand,
	AddZoneCommand
} from '../commands/Commands';

function SidebarAddPanel(parent, title, names, commands) {
	const container = new UIPanel();

	// Header
	const headerRow = new UIRow();
	headerRow.add(new UIText(title.toUpperCase()));
	container.add(headerRow);

	// Buttons

	const btnRow = new UIRow();

	names.forEach((name, index) => {
		const button = new UIButton(name);
		button.onClick(commands[index]);
		btnRow.add(button);
	});

	container.add(btnRow);
	parent.add(container);

	return container;
}

export function DetectAddPanel(editor, container) {
	return SidebarAddPanel(
		container,
		'Add Detect',
		['Geometry', 'Filter', 'Quantity'],
		[
			() => editor.execute(new AddDetectGeometryCommand(editor)),
			() => editor.execute(new AddFilterCommand(editor)),
			() => alert('Not implemented')
		]
	);
}

export function FigureAddPanel(editor, container) {
	return SidebarAddPanel(
		container,
		'Add Figure',
		['Box', 'Cylinder', 'Sphere'],
		[
			() => editor.execute(new AddObjectCommand(editor, new BoxMesh())),
			() => editor.execute(new AddObjectCommand(editor, new CylinderMesh())),
			() => editor.execute(new AddObjectCommand(editor, new SphereMesh()))
		]
	);
}

export function ZoneAddPanel(editor, container) {
	return SidebarAddPanel(
		container,
		'Add Zone',
		['Constructive solid Zone'],
		[() => editor.execute(new AddZoneCommand(editor))]
	);
}
