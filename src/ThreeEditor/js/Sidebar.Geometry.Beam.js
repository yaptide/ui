import * as THREE from 'three';
import { isBeam } from '../util/Beam';
import { UINumber, UIRow, UIText } from './libs/ui.js';


export function BeamPanel(editor, beam) {


	const container = new UIRow();

	// direction

	const directionRow = new UIRow();
	const dirX = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const dirY = new UINumber().setPrecision(3).setWidth('50px').onChange(update);
	const dirZ = new UINumber().setPrecision(3).setWidth('50px').onChange(update);

	directionRow.add(new UIText('Direction ' + editor.unit.name).setWidth('90px'));
	directionRow.add(dirX, dirY, dirZ);
	container.add(directionRow);

	// energy

	const energyRow = new UIRow();
	const energy = new UINumber().onChange(update);
	const energyText = new UIText('Energy').setWidth('90px');

	energyRow.add(energyText);
	energyRow.add(energy);
	container.add(energyRow);



	updateUI();


	//

	function update() {
		const direction = new THREE.Vector3(dirX.getValue(), dirY.getValue(), dirZ.getValue());

		beam.direction.copy(direction);

		beam.energy = energy.getValue();

		updateUI();
	}

	function updateUI() {

		dirX.setValue(beam.direction.x);
		dirY.setValue(beam.direction.y);
		dirZ.setValue(beam.direction.z);

		energy.setValue(beam.energy);
	}



	editor.signals.objectChanged.add(function (object) {

		if (isBeam(object)) {
			updateUI();
		}

	});


	return container;

}



