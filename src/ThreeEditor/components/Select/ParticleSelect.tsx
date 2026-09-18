import { Box, Checkbox, Divider, FormControlLabel, Paper, Typography } from '@mui/material';
import { AutocompleteRenderValueGetItemProps } from '@mui/material/Autocomplete';
import { ReactNode, SyntheticEvent, useState } from 'react';

import { filterParticles, isMostAbundant, ParticleEntry } from '../../../types/ParticleCatalogue';
import { AutoCompleteSelect } from '../../../util/genericComponents/AutoCompleteSelect';

interface ParticleSelectSingleProps {
	multiple?: false;
	value?: number;
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number) => void;
}

interface ParticleSelectMultipleProps {
	multiple: true;
	value?: readonly number[];
	onChange?: (event: SyntheticEvent<Element, Event>, newValue: number[]) => void;
	renderValue?: (
		value: ParticleEntry[],
		getItemProps: AutocompleteRenderValueGetItemProps<true>
	) => ReactNode;
}

export type ParticleSelectProps = (ParticleSelectSingleProps | ParticleSelectMultipleProps) & {
	particles: readonly ParticleEntry[];
};

export function ParticleSelect(props: ParticleSelectProps) {
	const [showAllIsotopes, setShowAllIsotopes] = useState(false);

	const getOptionLabel = ({ displayName, z }: ParticleEntry) => {
		return z !== undefined ? `${displayName} (Z:${z})` : displayName;
	};

	const renderPaper = (paperProps: { children?: React.ReactNode }) => (
		<Paper>
			<Box
				sx={{ px: 1, py: 0.25 }}
				onMouseDown={event => event.preventDefault()}
				onClick={event => event.stopPropagation()}>
				<FormControlLabel
					control={
						<Checkbox
							checked={showAllIsotopes}
							onChange={event => setShowAllIsotopes(event.target.checked)}
							size='small'
						/>
					}
					label='Show all isotopes'
					sx={{
						'margin': 0,
						'& .MuiFormControlLabel-label': { fontSize: '12px' }
					}}
				/>
			</Box>
			<Divider />
			{paperProps.children}
		</Paper>
	);

	const renderOption = (liProps: any, particle: ParticleEntry) => {
		return (
			<Box
				component='li'
				{...liProps}>
				<Typography
					variant='body2'
					sx={{
						display: 'flex',
						width: '100%'
					}}>
					{particle.displayName}
					{particle.z !== undefined && (
						<Typography
							component='span'
							color='text.disabled'
							sx={{
								fontSize: 'inherit',
								lineHeight: 'inherit',
								marginLeft: 'auto',
								paddingLeft: '8px'
							}}>
							Z:{particle.z}
						</Typography>
					)}
				</Typography>
			</Box>
		);
	};

	if (props.multiple) {
		const selected = props.particles.filter(p => (props.value ?? []).includes(p.pdg));

		return (
			<AutoCompleteSelect
				multiple
				slots={{
					paper: renderPaper
				}}
				onChange={(event, newValue) => {
					props.onChange?.call(
						null,
						event,
						newValue.map(p => p.pdg)
					);
				}}
				renderValue={props.renderValue}
				value={selected}
				options={props.particles}
				getOptionLabel={option => getOptionLabel(option)}
				renderOption={renderOption}
				filterOptions={(options, state) =>
					filterParticles(
						state.inputValue,
						showAllIsotopes
							? options
							: options.filter(particle => isMostAbundant(particle, props.particles))
					)
				}
			/>
		);
	}

	return (
		<AutoCompleteSelect
			slots={{
				paper: renderPaper
			}}
			onChange={(event, newValue) => {
				if (newValue !== null) props.onChange?.call(null, event, newValue.pdg);
			}}
			value={props.particles.find(p => p.pdg === props.value)}
			options={props.particles}
			getOptionLabel={option => getOptionLabel(option)}
			renderOption={renderOption}
			filterOptions={(options, state) =>
				filterParticles(
					state.inputValue,
					showAllIsotopes
						? options
						: options.filter(particle => isMostAbundant(particle, props.particles))
				)
			}
		/>
	);
}
