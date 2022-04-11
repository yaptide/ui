import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import { AddDetectGeometryCommand, AddObjectCommand, AddZoneCommand } from '../commands/Commands';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';
import { UIHorizontalRule, UIPanel } from '../libs/ui.js';
import examples from '../../examples/examples';

function MenubarExamples(editor) {
	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent('Examples');
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// YAPTIDE examples
	options.add(
		...examples.map(data =>
			createOption('option', data.project.name, () => {
				editor.clear();
				editor.loader.load(data);
			})
		),
		new UIHorizontalRule()
	);

	return container;
}

export { MenubarAdd };
