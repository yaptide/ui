import * as THREE from 'three'

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

import { createOption } from './Menubar.js';

function MenubarAdd(editor) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass('menu');

	var title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/add'));
	container.add(title);

	var options = new UIPanel();
	options.setClass('options');
	container.add(options);




	// Group
	options.add(createOption('option', strings.getKey('menubar/add/group'), () => {

		var mesh = new THREE.Group();
		mesh.name = 'Zone';
		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	options.add(new UIHorizontalRule());

	const material = new THREE.MeshStandardMaterial({ wireframe: true, opacity: .2, transparent: true });

	// Box
	options.add(createOption('option', strings.getKey('menubar/add/box'), () => {

		var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
		geometry.translate(0, geometry.parameters.height / 2, 0);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Box';

		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	// Sphere
	options.add(createOption('option', strings.getKey('menubar/add/sphere'), () => {

		var geometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Sphere';

		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	// Cylinder
	options.add(createOption('option', strings.getKey('menubar/add/cylinder'), () => {

		var geometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);
		geometry.translate(0, geometry.parameters.height / 2, 0);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Cylinder';

		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	options.add(new UIHorizontalRule());

	return container;
}

export { MenubarAdd };
