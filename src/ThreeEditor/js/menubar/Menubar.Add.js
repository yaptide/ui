import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import { AddDetectGeometryCommand, AddObjectCommand, AddZoneCommand } from '../commands/Commands';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarAdd(editor) {
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/add'));
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// YAPTIDE zones
	options
		.add(
			createOption('option', 'Zone', () => {
				editor.execute(new AddZoneCommand(editor));
			})
		)
		.add(new UIHorizontalRule());

	// YAPTIDE detectors
	options
		.add(
			createOption('option', 'Detect Section', () => {
				editor.execute(new AddDetectGeometryCommand(editor));
			})
		)
		.add(new UIHorizontalRule());

	// Box Sphere & Cylinder
	options
		.add(
			createOption('option', strings.getKey('menubar/add/box'), () => {
				editor.execute(new AddObjectCommand(editor, new BoxMesh()));
			})
		)
		.add(
			createOption('option', strings.getKey('menubar/add/sphere'), () => {
				editor.execute(new AddObjectCommand(editor, new SphereMesh()));
			})
		)
		.add(
			createOption('option', strings.getKey('menubar/add/cylinder'), () => {
				editor.execute(new AddObjectCommand(editor, new CylinderMesh()));
			})
		)
		.add(new UIHorizontalRule());

	return container;
}

export { MenubarAdd };
