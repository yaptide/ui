import * as THREE from 'three';
import { UISelect, UIRow, UIText } from './libs/ui.js';
import { detectOptions } from '../util/Detect/DetectTypes';

export function DetectPanel(editor, section) {
	const container = new UIRow();

	// detect type

	const sectionTypeRow = new UIRow();
	const sectionType = new UISelect().setWidth('150px').setFontSize('12px');
	sectionType.setOptions(detectOptions).setValue(section.detectGeometryType);
	
	sectionTypeRow.add(new UIText(`Type`).setWidth('90px'));
	sectionTypeRow.add(sectionType);

	container.add(sectionTypeRow);

	return container;
}