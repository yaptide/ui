import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';
import { COMMON_MATERIAL_ICRUS } from '../../Simulation/Materials/materials';
import { SyntheticEvent } from 'react';
import SimulationMaterial from '../../Simulation/Materials/SimulationMaterial';

export interface MaterialSelectProps {
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number) => void;
	materials: Record<string, SimulationMaterial>;
	value?: string;
}

const isCommonMaterial = ({ icru }: SimulationMaterial) => COMMON_MATERIAL_ICRUS.includes(icru);

const commonCompare = (a: SimulationMaterial, b: SimulationMaterial): number => {
	const [aIcru, bIcru] = [a.icru, b.icru];
	if (isCommonMaterial(a) === isCommonMaterial(b)) {
		return aIcru - bIcru;
	} else if (isCommonMaterial(b)) return 1;
	return -1;
};

export function MaterialSelect(props: MaterialSelectProps) {
	const getOptionLabel = ({ icru, name }: SimulationMaterial) => {
		return `[${icru}] ${name}`;
	};

	return (
		<AutoCompleteSelect
			onChange={(event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, event, newValue.icru);
			}}
			value={props.materials[props.value ?? '']}
			options={Object.values(props.materials).sort(commonCompare)}
			groupBy={option => (isCommonMaterial(option) ? 'Common' : 'Other')}
			getOptionLabel={getOptionLabel}
		/>
	);
}
