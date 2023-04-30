import React from 'react';
import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';

export interface IParticleType {
	id: number;
	name: string;
}

export interface ParticleSelectProps {
	onChange?: (event: React.SyntheticEvent<Element, Event>, newValue: number) => void;
	particles: IParticleType[];
	value?: number;
}

export function ParticleSelect(props: ParticleSelectProps) {
	const getOptionLabel = ({ id, name }: IParticleType) => {
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
