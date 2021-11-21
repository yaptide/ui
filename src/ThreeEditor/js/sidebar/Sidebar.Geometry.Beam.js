import * as THREE from 'three';
import { isBeam } from '../../util/Beam';
import {
	createRowParamNumberXYZ,
	createRowParamNumber,
	createParticleTypeSelect
} from '../../util/UiUtils';
import { UIRow } from '../libs/ui.js';

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
		text: 'Energy mean [MeV/nucl]',
		min: 1e-12,
		update
	});
	container.add(energyRow);

	// energy spread

	const [energySpreadRow, energySpread, energySpreadLabel] = createRowParamNumber({
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

	// particle

	const [particleTypeRow, particleType, renderParticleType] = createParticleTypeSelect(update);
	container.add(particleTypeRow);

	// particle Z

	const [particleZRow, particleZ] = createRowParamNumber({
		text: `charge (Z)`,
		precision: 0,
		step: 1,
		update
	});
	container.add(particleZRow);

	// particle A

	const [particleARow, particleA] = createRowParamNumber({
		text: `nucleons (A)`,
		precision: 0,
		step: 1,
		update
	});
	container.add(particleARow);

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
		energySpreadLabel.setTextContent(
			`Energy spread [${beam.energySpread < 0 ? 'Mev/c' : 'MeV/nucl'}]`
		);
		energySpread.setValue(beam.energySpread);

		renderParticleType(beam.particle.id);

		const particleRows = [particleZRow, particleARow];
		particleRows.forEach(r => r.setDisplay(beam.particle.id === 25 ? '' : 'none'));

		particleZ.setValue(beam.particle.z);
		particleA.setValue(beam.particle.a);
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

		beam.particle.id = particleType.getValue();
		beam.particle.a = particleA.getValue();
		beam.particle.z = particleZ.getValue();

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
