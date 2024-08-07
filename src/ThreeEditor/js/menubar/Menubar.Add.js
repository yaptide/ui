import { BoxFigure, CylinderFigure, SphereFigure } from '../../Simulation/Figures/BasicFigures';
import { AddDetectGeometryCommand, AddObjectCommand, AddZoneCommand } from '../commands/Commands';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarAdd(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Add');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// YAPTIDE zones
	options.add(
		createOption('option', 'Zone', () => {
			editor.execute(new AddZoneCommand(editor));
		}),
		new UIHorizontalRule()
	);

	// YAPTIDE detectors
	options.add(
		createOption('option', 'Detect Geometry', () => {
			editor.execute(new AddDetectGeometryCommand(editor));
		}),
		new UIHorizontalRule()
	);

	// Box Sphere & Cylinder
	options.add(
		createOption('option', 'Box', () => {
			editor.execute(new AddObjectCommand(editor, new BoxFigure()));
		}),
		createOption('option', 'Sphere', () => {
			editor.execute(new AddObjectCommand(editor, new SphereFigure()));
		}),
		createOption('option', 'Cylinder', () => {
			editor.execute(new AddObjectCommand(editor, new CylinderFigure()));
		})
	);

	return container;
}

export { MenubarAdd };
