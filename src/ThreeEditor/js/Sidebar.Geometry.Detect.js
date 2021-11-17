import { UISpan } from './libs/ui.js';
import { detectOptions } from '../util/Detect/DetectTypes';
import { SetDetectGeometryCommand, SetDetectTypeCommand } from './commands/Commands';
import { createRowParamNumber, createRowSelect } from '../util/UiUtils';

export function DetectPanel(editor, section) {
	const container = new UISpan();
	let type = section.detectGeometryType;
	let data = section.detectGeometryData;

	// detect type
	const [sectionTypeRow, sectionType] = createRowSelect({ 
		text: `Type`, 
		update: updateType, 
		options: detectOptions,
		value: type
	});

	// width 
	const [widthRow, width] = createRowParamNumber({ 
		text: `X side length (width) ${editor.unit.name}`, 
		min: 0, 
		update,
		value: data.width
	});
	const [widthRow2, width2] = createRowParamNumber({ 
		text: `number of bins along X axis`, 
		min: 1, 
		update, 
		precision: 0,
		value: data.widthSegments
	});
	width2.setNudge(1).setStep(1);

	// height
	const [heightRow, height] = createRowParamNumber({ 
		text: `Y side length (height) ${editor.unit.name}`, 
		min: 0, 
		update,
		value: data.height
	});
	const [heightRow2, height2] = createRowParamNumber({ 
		text: `number of bins along Y axis`, 
		min: 1, 
		update, 
		precision: 0,
		value: data.heightSegments
	});
	height2.setNudge(1).setStep(1);

	// depth
	const [depthRow, depth] = createRowParamNumber({ 
		text: `Z side length (depth) ${editor.unit.name}`, 
		min: 0, 
		update,
		value: data.depth
	});
	const [depthRow2, depth2] = createRowParamNumber({ 
		text: `number of bins along Z axis`, 
		min: 1, 
		update, 
		precision: 0,
		value: data.depthSegments
	});
	depth2.setNudge(1).setStep(1);

	// radius
	const [radiusRow1, radius1] = createRowParamNumber({ 
		text: `Inner radius ${editor.unit.name}`, 
		min: 0,
		update, 
		value: data.radius
	});
	const [radiusRow2, radius2] = createRowParamNumber({ 
		text: `Outer radius ${editor.unit.name}`, 
		min: 0.001, 
		update,
		value: data.radius
	});
	const [radiusRow3, radius3] = createRowParamNumber({ 
		text: `Number of bins along radial axis`, 
		min: 1, 
		update, 
		precision: 0,
		value: data.radiusSegments
	});
	radius3.setNudge(1).setStep(1);

	// zoneid
	const [zoneidRow, zoneid] = createRowSelect({ 
		text: `Zone ID`, 
		update,
		value: editor.zonesManager.getZoneOptions()
	});

	//

	function refreshUI(){
		container.clear();
		sectionType.setValue(type);
		container.add(sectionTypeRow);

		switch(type){
			case 'Mesh':
				width.setValue(data.width);
				width2.setValue(data.widthSegments);
				height.setValue(data.height);
				height2.setValue(data.heightSegments);
				depth.setValue(data.depth);
				depth2.setValue(data.depthSegments);
				container.add(widthRow);
				container.add(widthRow2);
				container.add(heightRow);
				container.add(heightRow2);
				container.add(depthRow);
				container.add(depthRow2);
				break;
			case 'Cyl':
				depth.setValue(data.depth);
				depth2.setValue(data.depthSegments);
				radius1.setValue(data.innerRadius);
				radius2.setValue(data.outerRadius);
				radius3.setValue(data.radialSegments);
				container.add(depthRow);
				container.add(depthRow2);
				container.add(radiusRow1);
				container.add(radiusRow2);
				container.add(radiusRow3);
				break;
			case 'Zone':
				updateOptions();
				zoneid.setValue(data.zoneId);
				container.add(zoneidRow);
				break;
			default:
				break;
		}
	}

	function update() {
		editor.execute( new SetDetectGeometryCommand( editor, section, {
			width: width.getValue(),
			widthSegments: width2.getValue(),
			height: height.getValue(),
			heightSegments: height2.getValue(),
			depth: depth.getValue(),
			depthSegments: depth2.getValue(),
			innerRadius: radius1.getValue(),
			outerRadius: radius2.getValue(),
			radialSegments: radius3.getValue(),
			zoneId: parseInt(zoneid.getValue())
		}));
		refreshUI();
	}

	function updateType() {
		let type = sectionType.getValue();
		editor.execute( new SetDetectTypeCommand( editor, section, type));
		refreshUI();
	}

	function updateOptions(){
		let options = editor.zonesManager.getZoneOptions();
		zoneid.setOptions(options);
	}

	editor.signals.zoneAdded.add(updateOptions);
	editor.signals.zoneRemoved.add(updateOptions);
	editor.signals.objectSelected.add(refreshUI);
	
	refreshUI();

	return container;
}