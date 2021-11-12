import * as THREE from 'three';
import { UISelect, UIRow, UISpan, UIText, UINumber } from './libs/ui.js';
import { detectOptions } from '../util/Detect/DetectTypes';
import { SetDetectGeometryCommand, SetDetectTypeCommand } from './commands/Commands';

function createParamRow(update, value, text) {
	const row = new UIRow();
	const param = new UINumber(value).onChange(update);
	const paramText = new UIText(text).setWidth('90px');
	param.min = 0;

	row.add(paramText);
	row.add(param);

	return [row, param, paramText];
}

export function DetectPanel(editor, section) {
	const container = new UISpan();
	let type = section.detectGeometryType;
	let data = section.detectGeometryData;

	// detect type

	const sectionTypeRow = new UIRow();
	const sectionType = new UISelect().setWidth('150px').setFontSize('12px');
	sectionType.setOptions(detectOptions).onChange(updateType);
	
	sectionTypeRow.add(new UIText(`Type`).setWidth('90px'));
	sectionTypeRow.add(sectionType);

	// width 
	const [widthRow, width] = createParamRow(update, data.width, `X side length (width) ${editor.unit.name}`);

	// height
	const [heightRow, height] = createParamRow(update, data.height, `Y side length (height) ${editor.unit.name}`);

	// depth
	const [depthRow, depth] = createParamRow(update, data.depth, `Z side length (depth) ${editor.unit.name}`);

	// radius
	const [radiusRow, radius] = createParamRow(update, data.radius, `Radius ${editor.unit.name}`);

	// zoneid
	const zoneIdRow = new UIRow();
	const zoneId = new UISelect().setWidth('150px').setFontSize('12px');
	zoneId.onChange(update);
	
	zoneIdRow.add(new UIText(`Type`).setWidth('90px'));
	zoneIdRow.add(zoneId);

	//

	function refreshUI(){
		container.clear();
		sectionType.setValue(type);
		container.add(sectionTypeRow);

		switch(type){
			case 'Mesh':
				width.setValue(data.width);
				height.setValue(data.height);
				depth.setValue(data.depth);
				container.add(widthRow);
				container.add(heightRow);
				container.add(depthRow);
				break;
			case 'Cyl':
				height.setValue(data.height);
				radius.setValue(data.radius);
				container.add(heightRow);
				container.add(radiusRow);
				break;
			case 'Zone':
				updateOptions();
				zoneId.setValue(data.zoneId);
				container.add(zoneIdRow);
			default:
				break;
		}
	}

	function update() {
		editor.execute( new SetDetectGeometryCommand( editor, section, {
			width: width.getValue(),
			height: height.getValue(),
			depth: depth.getValue(),
			radius: radius.getValue(),
			zoneId: parseInt(zoneId.getValue())
		}));
	}

	function updateType() {
		let type = sectionType.getValue();
		editor.execute( new SetDetectTypeCommand( editor, section, type));
		refreshUI();
	}

	function updateOptions(){
		let options = editor.zonesManager.getZoneOptions();
		zoneId.setOptions(options);
	}

	refreshUI();

	return container;
}