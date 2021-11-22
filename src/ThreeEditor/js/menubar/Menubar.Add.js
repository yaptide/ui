import * as THREE from 'three';
import { BoxMesh, CylinderMesh, SphereMesh } from '../../util/BasicMeshes';
import { AddObjectCommand, AddZoneCommand, AddDetectGeometryCommand } from '../commands/Commands';
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

	const material = new THREE.MeshPhongMaterial({
		side: THREE.DoubleSide,
		transparent: true,
		opacity: 0.5,
		wireframe: true
	});

	//https://stackoverflow.com/questions/37090942/how-to-render-clipped-surfaces-as-solid-objects/37093210#37093210
	material.onBeforeCompile = function (shader) {
		shader.fragmentShader = shader.fragmentShader.replace(
			`gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,

			`gl_FragColor = ( gl_FrontFacing ) ? vec4( outgoingLight, diffuseColor.a ) : vec4( diffuse, opacity );`
		);
	};

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

	// HemisphereLight
	// Code adjusted from https://github.com/mrdoob/three.js/blob/r131/editor/js/Menubar.Add.js
	options.add(
		createOption('option', strings.getKey('menubar/add/hemispherelight'), () => {
			const skyColor = 0x00aaff; // Deep Sky Blue
			const groundColor = 0xffaa00; // Orange
			const intensity = 1;

			const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
			light.name = 'HemisphereLight';

			light.position.set(0, 10, 0);

			editor.execute(new AddObjectCommand(editor, light));
		})
	);

	return container;
}

export { MenubarAdd };
