import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';
import { SyntheticEvent } from 'react';

export interface ParticleType {
	id: number;
	name: string;
}

export interface ParticleSelectProps {
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number) => void;
	particles: readonly ParticleType[];
	value?: number;
}

export function ParticleSelect(props: ParticleSelectProps) {
	const getOptionLabel = ({ id, name }: ParticleType) => {
		return `[${id}] ${name}`;
	};

	return (
		<AutoCompleteSelect
			onChange={(event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, event, newValue.id);
			}}
			value={props.particles.find(p => p.id === props.value)}
			options={props.particles}
			getOptionLabel={option => getOptionLabel(option)}
		/>
	);
}
