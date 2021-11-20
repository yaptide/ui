import * as THREE from 'three';
import { isBeam } from '../util/Beam';
import { createRowParamNumberXYZ, createRowParamNumber } from '../util/UiUtils';
import { UIRow } from './libs/ui.js';

export function BeamPanel(editor, beam) {
	const container = new UIRow();

	// direction

	const [directionRow, directionX, directionY, directionZ] = createRowParamNumberXYZ({
		text: `Direction ${editor.unit.name}`,
		update
	});
	container.add(directionRow);

	// energy

	// set minimum energy to 1ueV (as lower limit of reasonable cross-section used in neutron transport)
	const [energyRow, energy] = createRowParamNumber({
		text: 'Energy [MeV]',
		min: 1e-12,
		update
	});
	container.add(energyRow);

	updateUI();

	//

	function updateUI() {
		directionX.setValue(beam.direction.x);
		directionY.setValue(beam.direction.y);
		directionZ.setValue(beam.direction.z);

		energy.setValue(beam.energy);
	}

	function update() {
		const direction = new THREE.Vector3(
			directionX.getValue(),
			directionY.getValue(),
			directionZ.getValue()
		);

		if (direction.length() > 0) beam.direction.copy(direction);

		beam.energy = energy.getValue();

		updateUI();
	}

	// signals

	editor.signals.objectChanged.add(object => {
		if (isBeam(object)) {
			updateUI();
		}
	});

	return container;
}
