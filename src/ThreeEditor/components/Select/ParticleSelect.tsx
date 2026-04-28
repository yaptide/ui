import { Box, Typography } from '@mui/material';
import { SyntheticEvent } from 'react';

import {
	filterParticles,
	isMostAbundantIsotope,
	ParticleEntry} from '../../../types/ParticleCatalogue';
import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';

export interface ParticleSelectProps {
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number) => void;
	particles: readonly ParticleEntry[];
	value?: number;
}

export function ParticleSelect(props: ParticleSelectProps) {
	const getOptionLabel = ({ pdg, displayName }: ParticleEntry) => {
		return `${displayName}`;
	};

	// Custom render for dropdown options
	const renderOption = (liProps: any, particle: ParticleEntry) => {
		const isMostAbundant = isMostAbundantIsotope(particle, props.particles) || false;
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
					{particle.displayName}
					{/* {abundanceText} */}
					{isMostAbundant && ' ★'}
				</Typography>
			</Box>
		);
	};

	return (
		<AutoCompleteSelect
			onChange={(event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, event, newValue.pdg);
			}}
			value={props.particles.find(p => p.pdg === props.value)}
			options={props.particles}
			getOptionLabel={option => getOptionLabel(option)}
			renderOption={renderOption}
			filterOptions={(options, state) => filterParticles(state.inputValue, options)}
		/>
	);
}
