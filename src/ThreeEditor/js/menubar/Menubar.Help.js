import { UIPanel } from '../libs/ui.js';
import { createOption } from './Menubar.js';

function MenubarHelp(editor) {
	const strings = editor.strings;

	const container = new UIPanel();
	container.setClass('menu');

	const title = new UIPanel();
	title.setClass('title');
	title.setTextContent(strings.getKey('menubar/help'));
	container.add(title);

	const options = new UIPanel();
	options.setClass('options');
	container.add(options);

	// Source code
	options.add(
		createOption('option', strings.getKey('menubar/help/source_code'), () => {
			window.open('https://github.com/mrdoob/three.js/tree/master/editor', '_blank');
		})
	);

	/*
	// Icon

	const option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( strings.getKey( 'menubar/help/icons' ) );
	option.onClick( function () {

		window.open( 'https://www.flaticon.com/packs/interface-44', '_blank' );

	} );
	options.add( option );
	*/

	// About
	options.add(
		createOption('option', strings.getKey('menubar/help/about'), () => {
			window.open('https://threejs.org', '_blank');
		})
	);

	// Manual
	options.add(
		createOption('option', strings.getKey('menubar/help/manual'), () => {
			window.open('https://github.com/mrdoob/three.js/wiki/Editor-Manual', '_blank');
		})
	);

	return container;
}

export { MenubarHelp };
