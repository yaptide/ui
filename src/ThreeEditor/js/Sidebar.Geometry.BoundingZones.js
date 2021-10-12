import * as THREE from 'three';
import { isBoundingZone } from '../util/BoundingZone';
import { SetGeometryCommand } from './commands/SetGeometryCommand.js';
import { UIButton, UINumber, UIRow, UIText } from './libs/ui.js';

function BoundingZonesPanel(editor, boundingZones) {

	const container = new UIRow();


	const calculateButton = new UIButton("CALCULATE BOUNDING ZONES");
	calculateButton.onClick(function () {
		boundingZones.calculate();
	});
	container.add(calculateButton);


	//

	function update() {


	}

	function updateUI() {


	}

	return container;

}

export { BoundingZonesPanel };

