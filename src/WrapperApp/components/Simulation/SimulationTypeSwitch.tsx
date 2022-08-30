import { Button } from '@mui/material';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../services/AuthService';

export type SimulationTypeSwitchJSON = {
	handleChange: (checked: boolean) => void;
};

const StyledSwitch = styled(Switch)(({ theme }) => ({
	'width': 62,
	'height': 34,
	'padding': 7,
	'& .MuiSwitch-switchBase': {
		'margin': 1,
		'padding': 0,
		'transform': 'translateX(6px)',
		'&.Mui-checked': {
			'color': '#fff',
			'transform': 'translateX(22px)',
			'& .MuiSwitch-thumb:before': {
				backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
					'#fff'
				)}" d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/></svg>')`
				// from https://mui.com/material-ui/material-icons/?query=clou&selected=Cloud
			},
			'& + .MuiSwitch-track': {
				opacity: 1,
				backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be'
			}
		}
	},
	'& .MuiSwitch-thumb': {
		'backgroundColor': theme.palette.mode === 'dark' ? '#003892' : '#001e3c',
		'width': 32,
		'height': 32,
		'&:before': {
			content: "''",
			position: 'absolute',
			width: '100%',
			height: '100%',
			left: 0,
			top: 0,
			backgroundRepeat: 'no-repeat',
			backgroundPosition: 'center',
			backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
				'#fff'
			)}" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>')`
			// from https://mui.com/material-ui/material-icons/?query=person&selected=Person
		}
	},
	'& .MuiSwitch-track': {
		opacity: 1,
		backgroundColor: theme.palette.mode === 'dark' ? '#8796A5' : '#aab4be',
		borderRadius: 20 / 2
	}
}));

function SimulationTypeSwitch(props: SimulationTypeSwitchJSON) {
	const { setDataReq, slurmData, isDataReq } = useAuth();

	const [checked, setChecked] = useState(false);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (!!slurmData.username && !!slurmData.secret) {
			console.log('handleChange', slurmData);
			setChecked(event.target.checked);
			props.handleChange(event.target.checked);
		} else {
			setDataReq(true);
		}
	};
	useEffect(() => {
		if (!slurmData.secret || !slurmData.username) setChecked(false);
	}, [slurmData]);

	return (
		<FormGroup>
			<Stack direction='row' spacing={1} alignItems='center' sx={{ height: 40 }}>
				<Typography>Internal</Typography>
				<StyledSwitch
					sx={{ m: 1 }}
					checked={checked}
					onChange={handleChange}
					inputProps={{ 'aria-label': 'sim type' }}
				/>
				<Typography>Slurm</Typography>
				{checked && (
					<Button color='secondary' onClick={() => setDataReq(true)}>
						Edit slurm data
					</Button>
				)}
			</Stack>
		</FormGroup>
	);
}

export default SimulationTypeSwitch;
