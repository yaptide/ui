import { Box, Button, Divider, Menu, MenuItem, useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import { MouseEvent, useEffect, useState } from 'react';

import { testIds } from '../../../util/testIds';
import { CommandButtonProps } from '../../../util/Ui/CommandButtonProps';

type MenuPositionProps = {
	label: string;
	idx: number;
	name?: string;
	openIdx: number;
	setOpenIdx: (open: number) => void;
	options: CommandButtonProps[][];
};

export default function MenuPosition({
	label,
	idx,
	name,
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

	let menuItemIndex = -1;

	return (
		<>
			<Button
				variant='text'
				sx={{ color: theme.palette.text.primary }}
				id={'menu-button-' + idx.toString()}
				data-testid={name ? testIds.menuButton(name) : undefined}
				aria-controls={Boolean(anchorEl) ? 'menu-content-' + idx.toString() : undefined}
				aria-haspopup='true'
				aria-expanded={Boolean(anchorEl) ? 'true' : undefined}
				onClick={handleClick}
				onMouseOver={handleEnter}
				disableRipple>
				<Typography
					sx={{
						textTransform: 'initial'
					}}>
					{label}
				</Typography>
			</Button>
			<Menu
				id={'menu-content-' + idx.toString()}
				data-testid={name ? testIds.menuPopup(name) : undefined}
				anchorEl={anchorEl}
				open={Boolean(anchorEl)}
				onClose={() => handleClose()}
				slotProps={{ list: { dense: true } }}>
				{options.map((section, row) => (
					<Box key={row}>
						{section.map((option, optionIdx) => {
							menuItemIndex += 1;

							return (
								<MenuItem
									sx={{
										fontSize: '.75rem',
										lineHeight: '1rem',
										padding: '.2rem .5rem',
										minWidth: '120px'
									}}
									data-testid={
										name ? testIds.menuItem(name, menuItemIndex) : undefined
									}
									key={optionIdx}
									onClick={() => {
										handleClose(option.onClick);
									}}
									disabled={option.disabled}>
									{option.label}
								</MenuItem>
							);
						})}
						{row < options.length - 1 && <Divider />}
					</Box>
				))}
			</Menu>
		</>
	);
}
