import { Beam } from '../../../util/Beam';
import {
	createParticleTypeSelect,
	createRowParamNumber,
	createRowParamNumberXYZ,
	hideUIElement,
	showUIElement
} from '../../../util/Ui/Uis';
import { Editor } from '../../Editor';
import { UINumber, UIRow, UIText } from '../../libs/ui';
import { ObjectAbstract } from './Object.Abstract';

export class ObjectBeam extends ObjectAbstract {
	object?: Beam;

	energy: UINumber;
	energyRow: UIRow;

	energySpread: UINumber;
	energySpreadRow: UIRow;
	energySpreadLabel: UIText;

	divergenceRow: UIRow;
	divergenceX: UINumber;
	divergenceY: UINumber;
	divergenceZ: UINumber;

	divergenceDistanceRow: UIRow;
	divergenceDistance: UINumber;

	particleTypeRow: UIRow;
	particleType: UINumber;
	renderParticleType: (value: number) => void;

	particleZRow: UIRow;
	particleZ: UINumber;

	particleARow: UIRow;
	particleA: UINumber;

	constructor(editor: Editor) {
		super(editor, 'Energy');

		// set minimum energy to 1ueV (as lower limit of reasonable cross-section used in neutron transport)
		[this.energyRow, this.energy] = createRowParamNumber({
			text: 'Energy mean',
			min: 1e-12,
			unit: 'MeV/nucl',
			update: this.update.bind(this)
		});

		// energy spread
		[this.energySpreadRow, this.energySpread, this.energySpreadLabel] = createRowParamNumber({
			text: 'Energy spread',
			update: this.update.bind(this)
		});

		// divergence XY
		[this.divergenceRow, this.divergenceX, this.divergenceY, this.divergenceZ] =
			createRowParamNumberXYZ({
				text: `Divergence XY`,
				unit: `mrad`,
				update: this.update.bind(this)
			});
		hideUIElement(this.divergenceZ);

		// divergence distance
		[this.divergenceDistanceRow, this.divergenceDistance] = createRowParamNumber({
			text: `Divergence distance to focal point`,
			unit: `${editor.unit.name}`,
			update: this.update.bind(this)
		});

		// particle
		[this.particleTypeRow, this.particleType, this.renderParticleType] =
			createParticleTypeSelect(this.update.bind(this));

		// particle Z
		[this.particleZRow, this.particleZ] = createRowParamNumber({
			text: `charge (Z)`,
			precision: 0,
			step: 1,
			update: this.update.bind(this)
		});

		// particle A

		[this.particleARow, this.particleA] = createRowParamNumber({
			text: `nucleons (A)`,
			precision: 0,
			step: 1,
			update: this.update.bind(this)
		});

		this.panel.add(
			this.energyRow,
			this.energySpreadRow,
			this.divergenceRow,
			this.divergenceDistanceRow,
			this.particleTypeRow,
			this.particleZRow,
			this.particleARow
		);
	}
	setObject(object: Beam): void {
		super.setObject(object);
		if (!object) return;

		this.object = object;

		this.divergenceX.setValue(object.divergence.x);
		this.divergenceY.setValue(object.divergence.y);
		this.divergenceDistance.setValue(object.divergence.distanceToFocal);

		this.energy.setValue(object.energy);
		this.energySpread.unit = object.energySpread < 0 ? 'Mev/c' : 'MeV/nucl';
		this.energySpread.setValue(object.energySpread);

		this.render();

		[this.particleZRow, this.particleARow].forEach(r => {
			if (object.particle.id === 25) showUIElement(r);
			else hideUIElement(r);
		});

		this.particleZ.setValue(object.particle.z);
		this.particleA.setValue(object.particle.a);
	}

	update(): void {
		const { object } = this;
		if (!object) return;
		object.energy = this.energy.getValue();
		object.energySpread = this.energySpread.getValue();

		object.divergence.x = this.divergenceX.getValue();
		object.divergence.y = this.divergenceY.getValue();
		object.divergence.distanceToFocal = this.divergenceDistance.getValue();

		object.particle.id = this.particleType.getValue();
		object.particle.a = this.particleA.getValue();
		object.particle.z = this.particleZ.getValue();
	}

	render(): void {
		if (!this.object) return;
		this.renderParticleType(this.object.particle.id);
	}
}
