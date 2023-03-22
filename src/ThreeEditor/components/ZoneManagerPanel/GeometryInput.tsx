import {
	Avatar,
	Box,
	Chip,
	MenuItem,
	Select,
	SelectChangeEvent,
	Tooltip,
	Typography
} from '@mui/material';
import { useState, useEffect } from 'react';

type GeometryInputProps = {
	id: number;
	geometries: THREE.Object3D[];
	value?: number | null;
	onClick?: React.MouseEventHandler<HTMLElement>;
};

function GeometryInput(props: GeometryInputProps) {
	const [selected, setSelected] = useState<THREE.Object3D | null>(null);

	useEffect(() => {
		setSelected(props.geometries.find(geo => geo.id === props.value) ?? null);
	}, [props.value, props.geometries]);

	return (
		<Chip
			onClick={props.onClick}
			color='secondary'
			label={selected?.name ?? 'Select'}
			avatar={
				<Avatar>
					<Tooltip title={selected?.id ?? ''} placement='right'>
						<Box>ID</Box>
					</Tooltip>
				</Avatar>
			}
			sx={{
				'minWidth': '70px',
				'display': 'flex',
				'flexDirection': 'row-reverse',
				'borderRadius': '0 0 16px 16px',
				'padding': '5px 2px',
				'minHeight': 40,
				'height': 40,
				'& .MuiChip-avatar': {
					marginLeft: '-6px',
					marginRight: '5px'
				}
			}}
		/>
	);
}
export default GeometryInput;
