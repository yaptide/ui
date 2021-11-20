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
		text: 'Energy mean',
		min: 1e-12,
		unit: 'MeV',
		update
	});
	console.log(energy)
	container.add(energyRow);

	// energy spread

	// set minimum energy to 1ueV (as lower limit of reasonable cross-section used in neutron transport)
	const [energySpreadRow, energySpread] = createRowParamNumber({
		text: 'Energy spread',
		update
	});
	container.add(energySpreadRow);

	// divergence XY

	const [divergenceRow, divergenceX, divergenceY, divergenceZ] = createRowParamNumberXYZ({
		text: `Divergence XY [mrad]`,
		update
	});
	divergenceZ.setDisplay('none');
	container.add(divergenceRow);

	// divergence distance

	const [divergenceDistanceRow, divergenceDistance] = createRowParamNumber({
		text: `Divergence distance to focal point ${editor.unit.name}`,
		update
	});
	container.add(divergenceDistanceRow);

	updateUI();

	//

	function updateUI() {
		directionX.setValue(beam.direction.x);
		directionY.setValue(beam.direction.y);
		directionZ.setValue(beam.direction.z);

		divergenceX.setValue(beam.divergence.x);
		divergenceY.setValue(beam.divergence.y);
		divergenceDistance.setValue(beam.divergence.distanceToFocal);

		energy.setValue(beam.energy);
		energySpread.setUnit(beam.energySpread < 0 ? 'Mev/c' : 'MeV/nucl');
		energySpread.setValue(beam.energySpread);
	}

	function update() {
		const direction = new THREE.Vector3(
			directionX.getValue(),
			directionY.getValue(),
			directionZ.getValue()
		);

		if (direction.length() > 0) beam.direction.copy(direction);

		beam.energy = energy.getValue();
		beam.energySpread = energySpread.getValue();

		beam.divergence.x = divergenceX.getValue();
		beam.divergence.y = divergenceY.getValue();
		beam.divergence.distanceToFocal = divergenceDistance.getValue();

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
