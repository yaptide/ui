import BlurOnIcon from '@mui/icons-material/BlurOn';
import CategoryIcon from '@mui/icons-material/Category';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import TextureIcon from '@mui/icons-material/Texture';
import { SpeedDial, SpeedDialAction } from '@mui/material';
import Box from '@mui/material/Box';
import { styled, useTheme } from '@mui/material/styles';
import React, { useCallback, useMemo } from 'react';

export enum SelectTool {
	GEOMETRIES,
	ZONES,
	DETECTION
}

const actions = [
	{ icon: <CategoryIcon />, name: 'Geometries', value: SelectTool.GEOMETRIES },
	{ icon: <TextureIcon />, name: 'Zones', value: SelectTool.ZONES },
	{ icon: <BlurOnIcon />, name: 'Detection', value: SelectTool.DETECTION }
];

type SelectSpeedDialProps = {
	selected: boolean;
	onClick: () => void;
	tool?: SelectTool;
	setTool: (tool?: SelectTool) => void;
};

export function SelectSpeedDial({ selected, onClick, tool, setTool }: SelectSpeedDialProps) {
	const theme = useTheme();

	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const CustomSpeedDial = useMemo(() => {
		return styled(SpeedDial)({
			'& .MuiButtonBase-root': {
				'width': 'unset',
				'height': 'unset',
				'minHeight': 'unset',
				'padding': '5px',
				'backgroundColor': selected ? 'rgba(255, 255, 255, 0.08)' : 'unset',
				'boxShadow': 'unset',
				'color': '#fff',
				'&:hover': {
					backgroundColor: 'rgba(255, 255, 255, 0.08)'
				}
			}
		});
	}, [selected]);

	const getDialIcon = useCallback(() => {
		switch (tool) {
			case SelectTool.GEOMETRIES:
				return <CategoryIcon />;
			case SelectTool.ZONES:
				return <TextureIcon />;
			case SelectTool.DETECTION:
				return <BlurOnIcon />;
			default:
				return <HighlightAltIcon />;
		}
	}, [tool]);

	return (
		<CustomSpeedDial
			ariaLabel='SpeedDial tooltip example'
			sx={{
				position: 'absolute',
				right: 170,
				top: '50%',
				transform: 'translateY(-18px)',
				padding: 0
			}}
			TransitionComponent={Box}
			icon={getDialIcon()}
			onClose={handleClose}
			onOpen={() => {
				handleOpen();
				onClick();
			}}
			direction='down'
			open={open}>
			{actions.map(action => (
				<SpeedDialAction
					key={action.name}
					icon={action.icon}
					sx={{
						'& .MuiButtonBase-root .MuiSvgIcon-root': {
							color: theme.palette.mode === 'dark' ? '#fff' : '#000'
						}
					}}
					tooltipTitle={action.name}
					tooltipOpen
					onClick={() => {
						handleClose();
						setTool(action.value);
					}}
				/>
			))}
		</CustomSpeedDial>
	);
}
