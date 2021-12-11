import { UIPanel, UIText, UIRow, UIButton } from '../libs/ui.js';
import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import {
	AddDetectGeometryCommand,
	AddFilterCommand,
	AddObjectCommand,
	AddZoneCommand,
	AddOutputCommand
} from '../commands/Commands';

function createButtons(
	parent,
	title,
	names,
	commands,
	areas = ['a', 'b', 'c'],
	gridTemplate = [`"a b c"`]
) {
	const container = new UIPanel();

	// Header
	const headerRow = new UIRow();
	headerRow.add(new UIText(title.toUpperCase()));
	container.add(headerRow);

	// Buttons

	const btnRow = new UIRow();
	btnRow.setDisplay('grid');
	btnRow.dom.style.gridTemplate = gridTemplate;
	btnRow.dom.style.gap = '2px';

	names.forEach((name, index) => {
		const button = new UIButton(name);
		button.onClick(commands[index]);
		button.dom.style.gridArea = areas[index];
		btnRow.add(button);
	});

	container.add(btnRow);
	parent.add(container);

	return container;
}

export function DetectAddPanel(editor, container) {
	return createButtons(
		container,
		'Add new',
		['Detect', 'Filter', 'Output'],
		[
			() => editor.execute(new AddDetectGeometryCommand(editor)),
			() => editor.execute(new AddFilterCommand(editor)),
			() => editor.execute(new AddOutputCommand(editor))
		]
	);
}

export function SceneAddPanel(editor, container) {
	return createButtons(
		container,
		'Add new',
		['Box', 'Cylinder', 'Sphere', 'Constructive solid Zone'],
		[
			() => editor.execute(new AddObjectCommand(editor, new BoxMesh())),
			() => editor.execute(new AddObjectCommand(editor, new CylinderMesh())),
			() => editor.execute(new AddObjectCommand(editor, new SphereMesh())),
			() => editor.execute(new AddZoneCommand(editor))
		],
		['a', 'b', 'c', 'd'],
		[`"a b c" "d d d"`]
	);
}
