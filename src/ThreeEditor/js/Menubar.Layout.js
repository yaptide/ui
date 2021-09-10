import { UIPanel, UIRow } from './libs/ui.js';

function MenubarLayout( editor ) {

	var strings = editor.strings;

	var container = new UIPanel();
	container.setClass( 'menu' );

	var title = new UIPanel();
	title.setClass( 'title' );
	title.setTextContent( 'Layout' );
	container.add( title );

	var options = new UIPanel();
	options.setClass( 'options' );
	container.add( options );

	// Single view

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( 'Single View' );
	option.onClick( function () {

		editor.signals.layoutChanged.dispatch('singleView');		

	} );
	options.add( option );

	// Four view

	var option = new UIRow();
	option.setClass( 'option' );
	option.setTextContent( 'Four Views' );
	option.onClick( function () {

		editor.signals.layoutChanged.dispatch('fourViews');

	} );
	options.add( option );



	return container;

}

export { MenubarLayout };
