import { Box, Button, Divider, Menu, MenuItem, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { MouseEvent, useEffect, useState } from 'react';

import { CommandButtonProps } from '../../../util/Ui/CommandButtonProps';

type MenuPositionProps = {
	label: string;
	idx: number;
	openIdx: number;
	setOpenIdx: (open: number) => void;
	options: CommandButtonProps[][];
};

export default function MenuPosition({
	label,
	idx,
	openIdx,
	setOpenIdx,
	options
}: MenuPositionProps) {
	const theme = useTheme();
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const handleClick = (_: MouseEvent<HTMLButtonElement>) => {
		setOpenIdx(idx);
	};

	const handleEnter = (_: MouseEvent<HTMLButtonElement>) => {
		if (openIdx !== -1) setOpenIdx(idx);
	};

	const handleClose = (action?: () => void) => {
		if (action) action();
		setOpenIdx(-1);
	};

	useEffect(() => {
		if (openIdx === idx) setAnchorEl(document.getElementById('menu-button-' + idx.toString()));
		else setAnchorEl(null);
	}, [openIdx, idx]);

	return (
		<>
			<Button
				variant='text'
				sx={{ color: theme.palette.text.primary }}
				id={'menu-button-' + idx.toString()}
				aria-controls={Boolean(anchorEl) ? 'menu-content-' + idx.toString() : undefined}
				aria-haspopup='true'
				aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
				onClick={handleClick}
				onMouseOver={handleEnter}
				disableRipple>
				<Typography
					id={`menu-${idx.toString()}-label`}
					textTransform='initial'>
					{label}
				</Typography>
			</Button>
			<Menu
				id={'menu-content-' + idx.toString()}
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleClose()}
				slotProps={{ list: { dense: true } }}>
				{options.map((section, row) => (
					<Box key={row}>
						{section.map((option, idx) => (
							<MenuItem
								sx={{
									fontSize: '.75rem',
									lineHeight: '1rem',
									padding: '.2rem .5rem',
									minWidth: '120px'
								}}
								key={idx}
								onClick={() => {
									handleClose(option.onClick);
								}}
								disabled={option.disabled}>
								{option.label}
							</MenuItem>
						))}
						{row < options.length - 1 && <Divider />}
					</Box>
				))}
			</Menu>
		</>
	);
}
