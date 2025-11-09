import { SyntheticEvent } from 'react';

import { Particle } from '../../../types/Particle';
import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';

export interface ParticleSelectProps {
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number) => void;
	particles: readonly Particle[];
	value?: number;
}

export function ParticleSelect(props: ParticleSelectProps) {
	const getOptionLabel = ({ id, name }: Particle) => {
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
