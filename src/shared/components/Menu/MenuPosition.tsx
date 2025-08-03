import { Box, Button, Divider, Menu, MenuItem } from '@mui/material';
import { SxProps } from '@mui/material/styles';
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
		if (openIdx === idx) setAnchorEl(document.getElementById('basic-button-' + idx.toString()));
		else setAnchorEl(null);
	}, [openIdx, idx]);

	return (
		<>
			<Button
				variant='text'
				sx={{ color: 'white' }}
				id={'basic-button-' + idx.toString()}
				aria-controls={Boolean(anchorEl) ? 'basic-menu' : undefined}
				aria-haspopup='true'
				aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
				onClick={handleClick}
				onMouseOver={handleEnter}
				disableRipple>
				<Typography textTransform='initial'>{label}</Typography>
			</Button>
			<Menu
				id='basic-menu'
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleClose()}
				slotProps={{
					list: {
						'aria-labelledby': 'basic-button',
						'dense': true
					}
				}}>
				{options.map((section, row) => (
					<Box key={row}>
						{section.map((option, idx) => (
							<MenuItem
								sx={{
									fontSize: '.75rem',
									lineHeight: '1rem',
									padding: '.2rem .5rem'
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
