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

	const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, transparent: true, opacity: .5 });

	//https://stackoverflow.com/questions/37090942/how-to-render-clipped-surfaces-as-solid-objects/37093210#37093210
	material.onBeforeCompile = function (shader) {

		shader.fragmentShader = shader.fragmentShader.replace(

			`gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,

			`gl_FragColor = ( gl_FrontFacing ) ? vec4( outgoingLight, diffuseColor.a ) : vec4( diffuse, opacity );`

		);
	};


	// Box

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/box'));
	option.onClick(function () {

		var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
		geometry.translate(0, geometry.parameters.height / 2, 0);
		var mesh = new THREE.Mesh(geometry, material.clone());
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
		var mesh = new THREE.Mesh(geometry, material.clone());
		mesh.name = 'Sphere';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);


	// Cylinder

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/cylinder'));
	option.onClick(function () {

		var geometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);
		geometry.translate(0, geometry.parameters.height / 2, 0);
		var mesh = new THREE.Mesh(geometry, material.clone());
		mesh.name = 'Cylinder';

		editor.execute(new AddObjectCommand(editor, mesh));

	});
	options.add(option);


	options.add(new UIHorizontalRule());

	// HemisphereLight

	var option = new UIRow();
	option.setClass('option');
	option.setTextContent(strings.getKey('menubar/add/hemispherelight'));
	option.onClick(function () {

		var skyColor = 0x00aaff;
		var groundColor = 0xffaa00;
		var intensity = 1;

		var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		light.name = 'HemisphereLight';

		light.position.set(0, 10, 0);

		editor.execute(new AddObjectCommand(editor, light));

	});
	options.add(option);


	return container;

}

export { MenubarAdd };
