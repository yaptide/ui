import * as THREE from 'three';
import { AddObjectCommand, AddZoneCommand } from './commands/Commands';
import { UIHorizontalRule, UIPanel } from './libs/ui.js';
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


	// YAPTIDE zones
	options.add(createOption('option', 'zone', () => {

		editor.execute(new AddZoneCommand(editor));
	}));


	options.add(new UIHorizontalRule());

	const material = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, transparent: true, opacity: 0.5, wireframe: true });

	//https://stackoverflow.com/questions/37090942/how-to-render-clipped-surfaces-as-solid-objects/37093210#37093210
	material.onBeforeCompile = function (shader) {

		shader.fragmentShader = shader.fragmentShader.replace(

			`gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,

			`gl_FragColor = ( gl_FrontFacing ) ? vec4( outgoingLight, diffuseColor.a ) : vec4( diffuse, opacity );`

		);
	};


	// Box
	options.add(createOption('option', strings.getKey('menubar/add/box'), () => {

		var geometry = new THREE.BoxGeometry(1, 1, 1, 1, 1, 1);
		var mesh = new THREE.Mesh(geometry, material.clone());
		mesh.name = 'Box';

		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	// Sphere
	options.add(createOption('option', strings.getKey('menubar/add/sphere'), () => {

		var geometry = new THREE.SphereGeometry(1, 16, 8, 0, Math.PI * 2, 0, Math.PI);
		var mesh = new THREE.Mesh(geometry, material.clone());
		mesh.name = 'Sphere';

		editor.execute(new AddObjectCommand(editor, mesh));
	}));





	// Cylinder
	options.add(createOption('option', strings.getKey('menubar/add/cylinder'), () => {

		var geometry = new THREE.CylinderGeometry(1, 1, 1, 16, 1, false, 0, Math.PI * 2);
		var mesh = new THREE.Mesh(geometry, material.clone());
		mesh.name = 'Cylinder';
		editor.execute(new AddObjectCommand(editor, mesh));
	}));

	options.add(new UIHorizontalRule());

	// HemisphereLight
	//Code adjusted from https://github.com/mrdoob/three.js/blob/r131/editor/js/Menubar.Add.js
	options.add(createOption('option', strings.getKey('menubar/add/hemispherelight'), () => {

		var skyColor = 0x00aaff; // Deep Sky Blue
		var groundColor = 0xffaa00; // Orange
		var intensity = 1;

		var light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		light.name = 'HemisphereLight';

		light.position.set(0, 10, 0);

		editor.execute(new AddObjectCommand(editor, light));
	}));



	return container;
}

export { MenubarAdd };

