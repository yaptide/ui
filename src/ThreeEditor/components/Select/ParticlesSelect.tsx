import { createTheme, ThemeProvider, useMediaQuery } from '@mui/material';
import React from 'react';
import { AutoCompleteSelect } from './AutoCompleteSelect';

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
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const theme = React.useMemo(
		() =>
			createTheme({
				palette: {
					mode: prefersDarkMode ? 'dark' : 'light'
				}
			}),
		[prefersDarkMode]
	);

	return (
		<ThemeProvider theme={theme}>
			<AutoCompleteSelect
				onChange={(event, newValue) => {
					if (newValue !== null) props.onChange?.call(null, event, newValue.id);
				}}
				value={props.particles.find(p => p.id === props.value)}
				options={props.particles}
				getOptionLabel={option => getOptionLabel(option)}
			/>
		</ThemeProvider>
	);
}
