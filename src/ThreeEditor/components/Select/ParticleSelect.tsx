import { Box, Typography } from '@mui/material';
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
		return `${name}`;
	};

	// Custom render for dropdown options
	const renderOption = (liProps: any, particle: Particle) => {
		const isMostAbundant = particle.isMostAbundant || false;
		// const abundanceText = particle.abundance ? ` (${particle.abundance.toFixed(2)}%)` : '';

		return (
			<Box
				component='li'
				{...liProps}>
				<Typography
					variant='body2'
					sx={{
						fontWeight: isMostAbundant ? 'bold' : 'normal',
						width: '100%'
					}}>
					{particle.name}
					{/* {abundanceText} */}
					{isMostAbundant && ' ★'}
				</Typography>
			</Box>
		);
	};

	return (
		<AutoCompleteSelect
			onChange={(event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, event, newValue.id);
			}}
			value={props.particles.find(p => p.id === props.value)}
			options={props.particles}
			getOptionLabel={option => getOptionLabel(option)}
			renderOption={renderOption}
		/>
	);
}
