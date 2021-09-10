import * as THREE from 'three'

import { UIPanel, UIRow, UIHorizontalRule } from './libs/ui.js';

import { AddObjectCommand } from './commands/AddObjectCommand.js';

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

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/group'));
	option.onClick(function () {

		var mesh = new THREE.Group();
		mesh.name = 'Zone';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);

	//

	options.add(new UIHorizontalRule());

	const material = new THREE.MeshStandardMaterial({ wireframe: true, opacity: .2, transparent: true });


	// Box

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/box'));
	option.onClick(function () {

		var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
		geometry.translate( 0, geometry.parameters.height / 2, 0 );
		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Box';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);


	// Sphere

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/sphere'));
	option.onClick(function () {

		var geometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);
		var mesh = new THREE.Mesh(geometry, material);
		mesh.name = 'Sphere';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);


	// Cylinder

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/add/cylinder' ) );
	option.onClick( function () {

		var geometry = new THREE.CylinderGeometry( 1, 1, 1, 16, 1, false, 0, Math.PI * 2 );
		geometry.translate( 0, geometry.parameters.height / 2, 0 );
		var mesh = new THREE.Mesh( geometry, material );
		mesh.name = 'Cylinder';
		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);



	options.add(new UIHorizontalRule());


	return container;

}

export { MenubarAdd };
