import {
	AddDetectGeometryCommand,
	AddFilterCommand,
	AddObjectCommand,
	AddOutputCommand,
	AddZoneCommand
} from '../commands/Commands';
import { BoxFigure, CylinderFigure, SphereFigure } from '../../Simulation/Figures/BasicFigures';
import { UIButton, UIPanel, UIRow, UIText } from '../libs/ui.js';

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
			() => editor.execute(new AddObjectCommand(editor, new BoxFigure())),
			() => editor.execute(new AddObjectCommand(editor, new CylinderFigure())),
			() => editor.execute(new AddObjectCommand(editor, new SphereFigure())),
			() => editor.execute(new AddZoneCommand(editor))
		],
		['a', 'b', 'c', 'd'],
		[`"a b c" "d d d"`]
	);
}
