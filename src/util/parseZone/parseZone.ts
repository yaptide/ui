import { AlgebraRow } from '../../ThreeEditor/components/ZoneManagerPanel/BooleanAlgebraRow';
import SimulationMaterial from '../../ThreeEditor/util/Materials/SimulationMaterial';
import ZoneConstructorController from './ZoneConstructorController';

function parseRow(zoneOperationRow: AlgebraRow) {
	let controller: ZoneConstructorController;
	if (zoneOperationRow.geometriesId?.[0]) {
		controller = new ZoneConstructorController([zoneOperationRow.geometriesId[0]], []);
		zoneOperationRow.operations.every((op, id) => {
			let nextGeo: number;
			if (!zoneOperationRow.geometriesId?.[id + 1] || !op) return false;
			else {
				nextGeo = zoneOperationRow.geometriesId?.[id + 1] as number;
				controller.parseOperation(op, nextGeo);
				// console.log(controller.toString().slice(0,-3)); // Preview parsed row to operation
			}
			return true;
		});
		return controller.toString();
	}
	return '';
}

export function parseZone(rows: AlgebraRow[], { name, icru }: SimulationMaterial): void {
	console.log(rows);
	let result: string = '';
	rows.forEach(el => {
		result = result.concat(parseRow(el) + ' OR');
	});
	console.log(result.slice(0, -3), name, icru);
}
